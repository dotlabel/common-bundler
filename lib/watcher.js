
/**
 * Adds simple watching, pass it a glob of files to watch and sit back and enjoy
 */

import fs from 'fs'
import path from 'path'
import EventEmitter from 'eventemitter3'

import chokidar from 'chokidar'
import chalk from 'chalk'

import { Logger, LOGLEVELS } from './utils'
import { EVENTS } from './events'
import createBundler from './bundler'

class Watcher extends EventEmitter {
    constructor( argv ) {
        super()

        // Create the bundler and kick things off with a fresh build
        this.bundler = createBundler( argv )
        this.bundler.once( EVENTS.BUNDLE_FINISH, () => {
            this.ready = true
            this.emit( EVENTS.READY )
        })
        this.bundler.bundle()

        this.ready = false
    }

    watch() {
        if ( !this.ready ) {
            this.once( EVENTS.READY, this.watch )
            return
        }

        console.log( 'watching' )
    }

}


export default function( argv ) {
    return new Watcher( argv )
}
