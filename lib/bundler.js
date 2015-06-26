
/**
 * _ _required_ root bundle directory
 * -o --output _required_ output directory
 * -d --debug _?_ adds debug mode to browserify
 * -v --verbose _?_ outputs more logging and throws errors
 * -t _?_ adds transforms to the pipeline, order is important
 */
// @example
// bundler ./src/bundles -o ./dist -t flowcheck -t babelify
// bundler ./src/bundles -d --skip react --remap react:react/dist.react -t babelify -o ./dist


import path from 'path'
import fs from 'fs'
import EventEmitter from 'eventemitter3'
import util from 'util'

import chalk from 'chalk'
import glob from 'glob'
import hrtime from 'pretty-hrtime'

import browserify from 'browserify'
import factor from 'factor-bundle'

import Writer from './bundler/writer'
import { Logger, LOGLEVELS } from './utils'
import { EVENTS } from './events'



class Bundler extends EventEmitter {
    constructor( argv ) {
        super()

        // CLI should have checked args are valid
        this.argv = argv

        this.writer = new Writer({
            argv: this.argv
        })

        this.logger = new Logger({
            loglevel: argv.v ? LOGLEVELS.verbose : LOGLEVELS.info
        })
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )
        this.error = this.logger.shorthand( 'error' )

        this.root = path.resolve( this.argv._[ 0 ] )

        // Sync check if output path exists
        let outPath = path.resolve( this.argv.output )
        if ( !fs.existsSync( outPath ) ) {
            try {
                this.log( 'Creating output directory', chalk.yellow( this.argv.output ) )
                fs.mkdirSync( outPath )
            } catch( mkdirerr ) {
                this.error( 'Error creating output directory' )
            }
        }
    }

    /**
     * @param globpath <String>
     * @returns <Array:strings> array of resolved paths to entry points
     */
    getSourceRoots( globpath: string ) {
        return new Promise( ( resolve, reject ) => {

            glob( globpath, ( err, files ) => {
                if ( err ) {
                    this.error( 'Error with file glob for entry points' )
                    reject( err )
                }

                resolve( files.map( file => path.resolve( file )))
            })
        })
    }

    /**
     * Works out the bundled name from the file path
     */
    bundledName = ( filepath ) => {
        return path.dirname( path.relative( this.root, filepath ) )
    }

    bundle() {
        let entryGlob = path.join( this.root, '*/main.js*' )
        this.verbose( 'Globbing for browserify entry points', chalk.yellow( entryGlob ) )

        let startTime = process.hrtime()

        // Grabs project entry points
        this.getSourceRoots( entryGlob )
            // Generate browserify bundle
            .then( files => {
                // Attach to this - @TODO tidy this rubbish up
                this.entries = files

                // Create bundler
                return browserify({
                    entries: this.entries,
                    debug: this.argv.debug || false,
                    paths: [
                        './node_modules',
                        './src'
                    ],
                    extensions: [
                        '.js',
                        '.jsx'
                    ]
                })
                    // Attach plugins to bundle - needs to be here @TODO why?
                    .plugin( factor, {
                        o: this.entries.map( this.bundledName ).map( this.writer.stream )
                    })
            })
            // Attach event listeners to bundle object
            .then( bundler => {
                return bundler
                    .on( 'file', ( file, id, parent ) => {
                        // Only log module entry files
                        if ( file === id ) {
                            this.log( 'Generating bundle:', chalk.yellow( this.bundledName( id ) ) )
                            return
                        }

                        // Log other files
                        this.verbose( chalk.blue( '-' ), path.relative( './', file ) )
                    })
                    .on( 'bundle', bundle => {
                        this.log( 'Generating:', chalk.yellow( 'common' ) )
                    })
            })
            // Attach transforms to bundle
            .then( bundler => {
                if ( this.argv.transform ) {
                    let transforms = util.isArray( this.argv.transform )
                        ? this.argv.transform
                        : [ this.argv.transform ]

                    transforms.forEach( transform => {
                        this.log( 'Adding transform:', chalk.cyan( transform ) )
                        bundler.transform( transform )
                    })
                }

                return bundler
            })
            // Fire into the bundler
            .then( bundler => {
                bundler.bundle()
                    .on( 'error', err => {
                        this.error( err.message )
                        this.verbose( chalk.red( 'stack' ), err.stack )
                    })
                    .pipe( this.writer.stream( 'common' ) )

                this.writer.on( EVENTS.WRITE_FINISH, () => {
                    this.log( chalk.green( 'OK' ) )

                    this.verbose(
                        chalk.blue( '-' ),
                        'Compile time:',
                        chalk.magenta( hrtime( process.hrtime( startTime ) ) )
                    )
                })
            })
            .catch( err => {
                this.error( 'Error in promise chain generating the bundle' )
                this.error( err )
                this.verbose( err.stack )
            })
    }
}


export default function( argv ) {
    return new Bundler( argv )
}
