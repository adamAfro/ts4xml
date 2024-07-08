import parse from "./parser.ts"
import schemize from "./schemize.ts"

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

for (let test of Deno.readDirSync('test/props')) {

    if (!test.name.endsWith('.d.ts')) continue

    let path = `test/props/${test.name}`
    Deno.test(test.name, () => {
    
        let output = JSON.stringify(parse(path), null, 2)
        let expected = Deno.readTextFileSync(`test/props/${test.name}.json`)
    
        assertEquals(output, expected)
    })
}

for (let test of Deno.readDirSync('test/interf')) {

    if (!test.name.endsWith('.d.ts')) continue

    let path = `test/interf/${test.name}`
    Deno.test(test.name, () => {
    
        let output = JSON.stringify(parse(path), null, 2)
        console.log(output)
        let expected = Deno.readTextFileSync(`test/interf/${test.name}.json`)
    
        assertEquals(output, expected)
    })
}

for (let test of Deno.readDirSync('test/interf')) {

    if (!test.name.endsWith('.d.ts')) continue

    let path = `test/interf/${test.name}`
    Deno.test(test.name, () => {
    
        let output = schemize(parse(path)).toString()
            .replace(/\n+/g, '\n')
            .replace(/\s+/g, ' ').trim()
        
        let expected = Deno.readTextFileSync(`test/interf/${test.name}.xsd`)
            .replace(/\n+/g, '\n')
            .replace(/\s+/g, ' ').trim()
        
        assertEquals(output, expected)
    })
}