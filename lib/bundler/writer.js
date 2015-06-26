
import path from 'path'
import fs from 'fs'
import EventEmitter from 'eventemitter3'
import { fork } from 'child_process'

import chalk from 'chalk'
import hrtime from 'pretty-hrtime'
import concat from 'concat-stream'

import { Logger, LOGLEVELS } from '../utils'
import { EVENTS } from '../events'


export default class Writer extends EventEmitter {
    constructor( opts ) {
        super()

        this.argv = opts.argv

        this.logger = new Logger({
            loglevel: opts.argv.v ? LOGLEVELS.verbose : LOGLEVELS.info
        })
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )
        this.error = this.logger.shorthand( 'error' )

        this.sources = 0
    }

    /**
     * Returns a concat-stream for factor-bundle browserify plugin
     */
    stream = ( bundleName ) => {
        var outPath = path.join( this.argv.output, bundleName + '.js' )
        return concat( body => {
            this.sources++
            let startTime = process.hrtime()

            // Create uglify fork which will either return uglified or untouched
            let debug = this.argv.debug
            let child = fork( path.join( __dirname, './uglifier.js' ), {
                env: {
                    debug: debug
                }
            })

            this.log( debug ? 'Writing:' : 'Uglifying:', chalk.yellow( bundleName ) )

            // Attach listeners to child process
            child.on( 'error', this.error )
            child.on( 'message', message => {
                fs.writeFile( outPath, message.body, { encoding: 'utf8' }, err => {
                    if ( err ) {
                        this.error( 'Error writing to file' )
                        throw new Error( err )
                    }

                    // Output time taken to process to file
                    this.verbose(
                        chalk.blue( '-' ),
                        'Write complete:',
                        chalk.yellow( bundleName ),
                        chalk.magenta( hrtime( process.hrtime( startTime ) ) )
                    )

                    if ( --this.sources === 0 ) {
                        console.log( 'emitting' )
                        this.emit( EVENTS.WRITE_FINISH )
                    }

                    child.kill()
                })
            })

            // Send code to the child
            child.send({
                bundleName: bundleName,
                body: body.toString()
            })
        })
    }
}
