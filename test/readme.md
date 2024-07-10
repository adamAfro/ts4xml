# Expectations - unit tests

For each section there is expected JSON and XSD output.
Test scripts parses this file and tests those sections:

* **extraction**: deep equal with extracted JSON output;
* **converting**: string equalness after removing repeating spaces
    and spaces before closing characters `/>`.






## String property

```ts
interface Element { char: string; }
```

```json
[{
    "name": "Element",
    "properties": [{
        "name": "char",
        "mandatory": true,
        "types": [
            "string"
        ]
    }]
}]
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"> 
    <xs:element name="Element"> 
        <xs:complexType > 
            <xs:attribute type="xs:string" use="required" name="char"/> 
        </xs:complexType> 
    </xs:element> 
</xs:schema>
```






## Optional string property

```ts
interface Element { char?: string; }
```

```json
[{
    "name": "Element",
    "properties": [{
        "name": "char",
        "types": [
            "string"
        ]
    }]
}]
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"> 
    <xs:element name="Element"> 
        <xs:complexType > 
            <xs:attribute type="xs:string" name="char"/> 
        </xs:complexType> 
    </xs:element> 
</xs:schema>
```






## String literals

```ts
interface PropEl { values: 'a' | 'b' | 'c' }
```

```json
[{
  "name": "PropEl",
  "properties": [{
    "name": "values",
    "mandatory": true,
    "multiple": false,
    "types": [
      { "value": [ "a" ]},
      { "value": [ "b" ]},
      { "value": [ "c" ]}
    ]
  }]
}]
```






## Element with array type

```ts
interface ArrayEl { chars: string[] }
```






## Multiple interfaces

```ts
interface PropEl { char: string }
interface PropsEl { char: string, num: number }
interface PropsOptEl { char: string, bool?: boolean }
```

```json
[
  {
    "name": "PropEl",
    "properties": [{"name": "char", "mandatory": true, "types": ["string"]}]
  },
  {
    "name": "PropsEl",
    "properties": [
      {"name": "char", "mandatory": true, "types": ["string"]},
      {"name": "num", "mandatory": true, "types": ["number"]}
    ]
  },
  {
    "name": "PropsOptEl",
    "properties": [
      {"name": "char", "mandatory": true, "types": ["string"]},
      {"name": "bool", "types": ["boolean"]}
    ]
  }
]
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  
    <xs:element name="PropEl">
      
        <xs:complexType >
          
            <xs:attribute type="xs:string" use="required" name="char" />
        
        </xs:complexType>

    </xs:element>
    
    <xs:element name="PropsEl">
      
        <xs:complexType >
          
            <xs:attribute type="xs:string" use="required" name="char" />
            <xs:attribute type="xs:decimal" use="required" name="num" />
    
        </xs:complexType>
    </xs:element>
    
    <xs:element name="PropsOptEl">
      
        <xs:complexType >      
            <xs:attribute type="xs:string" use="required" name="char" />
            <xs:attribute type="xs:boolean" name="bool" />
        </xs:complexType>

    </xs:element>
    
</xs:schema>
```






## Element with array of references

```ts
interface PropEl {}

interface PropsEl {}

interface PropsOptEl {}

interface ArrayEl {}

interface ArrayPropElTuple {
    various: (string|PropEl|PropsEl|PropsOptEl)[];
}
```






## Element with string as children

```ts
interface Parent { children: string }
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="Parent" type="xs:string"/>

</xs:schema>
```

## Element with other element as children

```ts
interface Child { children: string }
interface Parent { children: Child }
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="Child" type="xs:string"/>

  <xs:element name="Parent">
    <xs:complexType>
      <xs:sequence>
        <xs:element ref="Child" minOccurs="1" maxOccurs="1"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

</xs:schema>
```