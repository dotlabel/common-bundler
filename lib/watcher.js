
/**
 * Adds simple watching, pass it a glob of files to watch and sit back and enjoy
 */

import fs from 'fs'
import path from 'path'

import chokidar from 'chokidar'
import chalk from 'chalk'

import { Logger, LOGLEVELS } from './utils'

class Watcher {
    constructor() {

    }

}


export default function( argv ) {
    return new Watcher( argv )
}
