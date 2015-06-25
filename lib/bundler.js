
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

let Writer = require( './bundler/writer' )
import { Logger } from './utils'



class Bundler extends EventEmitter {
    constructor( argv ) {
        super()

        this.writer = new Writer({
            argv: argv
        })

        this.logger = new Logger()
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )

        // this.root = path.resolve( argv._[ 0 ] )
    }

    bundle() {
        this.logger.log( chalk.blue( 'I am bundling, shizzle' ) )
        this.log( 'short', chalk.yellow( 'hand' ) )
    }
}


export default function( argv ) {
    let bundler = new Bundler( argv )
    bundler.bundle()
}
