import Markdown from 'https://esm.sh/markdown-it@14.1.0'
import extract from '../extract.ts'
import scheme from '../scheme.ts'

import { fail, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

let script = new URL(import.meta.url).pathname
let dir = script.substring(0, script.lastIndexOf('/'))
let file = await Deno.readTextFile(`${dir}/readme.md`)
let contents = new Markdown().parse(file, {})

let sections = [] as Section[]
interface Section { 
    name: string, 
    input: string, 
    extracted: string,
    converted: string
}

for (let i = 0; i < contents.length; i++) {

    let section = sections[sections.length - 1]
    let tag = contents[i]

    if (tag.type == 'heading_open' && tag.tag == 'h2') {

        sections.push({} as Section)
        section = sections[sections.length - 1]
        while (contents[i].type != 'heading_close')
            section.name = contents[i++].content

    } else if (tag.type = 'fence') switch (tag.info) {

        case 'ts':    section.input = tag.content;      break
        case 'json':  section.extracted = tag.content;  break
        case 'xsd':   section.converted = tag.content;  break
    }
}

for (let section of sections) {

    let types: null|ReturnType <typeof extract> = null
    let schema: null|ReturnType <typeof scheme> = null
    try {

        types = extract(section.input)
        schema = scheme(types)
        
    } catch (error) { console.warn(error) }

    if (section.name.startsWith('TODO'))
        continue

    Deno.test({
        name: section.name + ' (extraction)',
        ignore: section.extracted ? false : true, fn: () => {

            if (!types) fail('No types extracted')

            assertEquals(types, JSON.parse(section.extracted))
        }
    })

    Deno.test({
        name: section.name + ' (conversion)',
        ignore: section.converted ? false : true, fn: () => {

            if (!schema) fail('No schema generated')

            let output = schema.toString()
                .replace(/\s*\n\s*/g, '\n')
                .replace(/ \/>/g, '/>')
                .replace(/ >/g, '>')
                .replace(/[\t\r ]+/g, ' ').trim()
            
            let expected = section.converted
                .replace(/\s*\n\s*/g, '\n')
                .replace(/ \/>/g, '/>')
                .replace(/ >/g, '>')
                .replace(/[\t\r ]+/g, ' ').trim()
            
            assertEquals(output, expected)
        }
    })
}