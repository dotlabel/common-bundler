
import EventEmitter from 'events'



export default class Writer extends EventEmitter {
    constructor() {
        console.log( 'writer instantiated' )
    }
}
