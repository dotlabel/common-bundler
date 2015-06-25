
/**
 * _ _required_ root bundle directory
 * -o --output _required_ output directory
 * -d --debug _?_ adds debug mode to browserify
 * --verbose _?_ outputs more logging and throws errors
 * --skip _?_ passed to browserify.noParse
 * -r --remap _?_ remaps require calls
 * -t _?_ adds transforms to the pipeline, order is important
 */
// @example
// bundler ./src/bundles -o ./dist -t flowcheck -t babelify
// bundler ./src/bundles -d --skip react --remap react:react/dist.react -t babelify -o ./dist


import path from 'path'
import EventEmitter from 'events'

import chalk from 'chalk'
import glob from 'glob'

import browserify from 'browserify'

let Writer = require( './bundler/writer' )
import { Logger, LOGLEVELS } from './utils'



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

        // @TODO remove
        this.log( this.argv )

        this.root = path.resolve( this.argv._[ 0 ] )
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

    bundle() {
        let entryGlob = path.join( this.root, '*/main.js*' )
        this.verbose( 'Globbing for browserify entry points', chalk.yellow( entryGlob ) )

        this.getSourceRoots( entryGlob )
            .then( files => {
                return browserify({
                    entries: files,
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
            })
            .then( bundle => {
                this.log( 'bundle formed' )
            })
    }
}


export default function( argv ) {
    let bundler = new Bundler( argv )
    bundler.bundle()
}
