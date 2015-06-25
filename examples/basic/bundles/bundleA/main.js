
import './bundleADep'
import 'common/menu'

console.log( 'bundleA::main' )
console.log( 'bundleA dependency should already have logged to prove it exists in the bundle' )
console.log( 'common/menu should also have logged as that is included' )
