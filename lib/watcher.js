
/**
 * Adds simple watching, pass it a glob of files to watch and sit back and enjoy
 */

import fs from 'fs'
import path from 'path'
import EventEmitter from 'eventemitter3'

import chokidar from 'chokidar'
import chalk from 'chalk'
import glob from 'glob'

import { Logger, LOGLEVELS } from './utils'
import { EVENTS } from './events'
import createBundler from './bundler'

class Watcher extends EventEmitter {
    constructor( argv ) {
        super()

        this.argv = argv

        // Create the bundler and kick things off with a fresh build
        this.bundler = createBundler( argv )
        this.bundler.once( EVENTS.BUNDLE_FINISH, () => {
            this.ready = true
            this.emit( EVENTS.READY )
        })
        this.bundler.bundle()

        // Create pretty log instance
        this.logger = new Logger({
            title: '  [scriptwatch]',
            loglevel: argv.v ? LOGLEVELS.verbose : LOGLEVELS.info
        })
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )
        this.error = this.logger.shorthand( 'error' )

        this.ready = false
        this.building = false
        this.buildRequest = false
    }

    compile() {
        if ( this.building ) {
            this.buildRequest = true
            return
        }

        this.building = true
        this.bundler.once( EVENTS.BUNDLE_FINISH, () => {
            this.building = false
            if ( this.buildRequest ) {
                this.buildRequest = false
                this.compile()
            }
        })
        this.bundler.bundle()
    }

    watch() {
        if ( !this.ready ) {
            this.once( EVENTS.READY, this.watch )
            return
        }

        glob( this.argv.watch, ( err, files ) => {
            if ( err ) {
                this.error( 'Error with file glob for entry points' )
                throw new Error( err )
            }

            let watcher = chokidar.watch( files )
                .on( 'change', filepath => {
                    this.log( chalk.yellow( 'change' ), filepath )

                    this.compile()
                })
                .on( 'ready', () => {
                    this.log( 'Watching for changes...' )
                    // List watched files
                    var filepath = ''
                    Object.keys( watcher._watched ).forEach( key => {
                        Object.keys( watcher._watched[ key ]._items ).forEach( item => {
                            filepath = path.join( key, item )
                            this.verbose( chalk.cyan( 'watch' ), filepath.replace( process.env.PWD + '/', '' ) )
                        })
                    })
                })
        })

    }

}


export default function( argv ) {
    return new Watcher( argv )
}
