
import path from 'path'
import minimist from 'minimist'

let argv = minimist( process.argv.slice( 2 ) )

/**
 * Require each file to run tests held within
 */
argv._.forEach( file => {
    require( path.resolve( file ) )
})

