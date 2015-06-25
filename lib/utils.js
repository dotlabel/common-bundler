
import chalk from 'chalk'

/**
 * Loglevel enum
 */
export const LOGLEVELS = {
    silly: 0,
    verbose: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5
}

// Private write function symbol for Logger
var write = Symbol( 'write' )

/**
 * @class Logger
 * @description Friendly wrapper around console log
 */
export class Logger {
    constructor( opts = {
        loglevel: LOGLEVELS.info,
        title: '  [bundler]'
    }) {
        // Dirty copy opts to class
        for ( let [ key, value ] of Object.entries( opts ) ) {
            if ( !this[ key ] ) {
                this[ key ] = value
            }
        }

        // Add private write function
        this[ write ] = function() {
            console.log( chalk.grey( this.title ), ...arguments )
        }.bind( this )
    }

    /**
     * Returns a bound method to allow shorthand calling
     * e.g. this.log instead of this.logger.log
     */
    shorthand( method ) {
        if ( !this[ method ] ) {
            throw new Error( 'Attempting to access unknown Logger method' )
        }

        return this[ method ].bind( this )
    }

    /**
     * Equivalent to info level logs
     */
    log() {
        if ( this.loglevel > LOGLEVELS.info ) {
            return
        }

        this[ write ]( ...arguments )
    }

    /**
     * Verbose logging
     */
    verbose() {
        if ( this.loglevel > LOGLEVELS.verbose ) {
            return
        }

        this[ write ]( arguments )
    }
}
