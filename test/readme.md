# Expectations - unit tests

For each section there is expected JSON and XSD output.
Test scripts parses this file and tests those sections:

* **extraction**: deep equal with extracted JSON output;
* **converting**: string equalness after removing repeating spaces
    and spaces before closing characters `/>`.






## String property

```ts
class Element { char: string }
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
class Element { char?: string }
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
class Choice { value: 'a' | 'b' | 'c' }
```

```json
[{
  "name": "Choice",
  "properties": [{
    "name": "value",
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

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="Choice">
    <xs:complexType>
      <xs:attribute name="value">
        <xs:simpleType>
          <xs:restriction base="xs:string">
            <xs:enumeration value="a"/>
            <xs:enumeration value="b"/>
            <xs:enumeration value="c"/>
          </xs:restriction>
        </xs:simpleType>
      </xs:attribute>
    </xs:complexType>
  </xs:element>
</xs:schema>
```






## Element with array type

```ts
class ArrayEl { chars: string[] }
```






## Multiple functions

```ts
class PropEl { char: string }
class PropsEl { char: string, num: number }
class PropsOptEl { char: string, bool?: boolean }
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





## Empty element


```ts
class I {}
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="I">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:length value="0"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:element>
</xs:schema>
```




## Element with string as children

```ts
class Parent { children: string }
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="Parent" type="xs:string"/>

</xs:schema>
```

## Element with other element as children

```ts
class Child { children: string }
class Parent { children: Child }
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





## String property and children

```ts
class Element { char: string; children: string }
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
    }, {
        "name": "children",
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
        <xs:complexType mixed="true">
            <xs:attribute type="xs:string" use="required" name="char"/>
        </xs:complexType> 
    </xs:element> 
</xs:schema>
```






## Element with multiple elements as children

```ts
class I1 {}
class I2 {}
class Refs {
    children: (ReturnType<typeof I1>|ReturnType<typeof I2>)[];
}
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  
    <xs:element name="I1">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
  
    <xs:element name="I2">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
    
    <xs:element name="Refs">

      <xs:complexType >
        <xs:sequence>
          <xs:element ref="I1" minOccurs="0" maxOccurs="unbounded"/>
          <xs:element ref="I2" minOccurs="0" maxOccurs="unbounded"/>
        </xs:sequence>
      </xs:complexType>
    </xs:element>

</xs:schema>
```






## Element with multiple elements and text

```ts
class I1 {}
class I2 {}
class RefsTxt { children: (string|ReturnType<typeof I1>|ReturnType<typeof I2>)[] }
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  
    <xs:element name="I1">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
  
    <xs:element name="I2">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
    
    <xs:element name="RefsTxt">
      
        <xs:complexType mixed="true">
            <xs:sequence>
                <xs:element ref="I1" minOccurs="0" maxOccurs="unbounded"/>
                <xs:element ref="I2" minOccurs="0" maxOccurs="unbounded"/>
            </xs:sequence>
        </xs:complexType>
    
    </xs:element>

 </xs:schema>
```






## Element with multiple elements and text while other simple types are ignored

```ts
class I1 {}
class I2 {}
class RefsTxt { 
  children: (string|number|boolean|ReturnType<typeof I1>|ReturnType<typeof I2>)[]
}
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  
    <xs:element name="I1">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
  
    <xs:element name="I2">
      <xs:simpleType>
        <xs:restriction base="xs:string">
          <xs:length value="0"/>
        </xs:restriction>
      </xs:simpleType>
    </xs:element>
    
    <xs:element name="RefsTxt">
      
        <xs:complexType mixed="true">
            <xs:sequence>
                <xs:element ref="I1" minOccurs="0" maxOccurs="unbounded"/>
                <xs:element ref="I2" minOccurs="0" maxOccurs="unbounded"/>
            </xs:sequence>
        </xs:complexType>
    
    </xs:element>

 </xs:schema>
```






## TODO Use typescript-type keyword as array for grouping

```ts
class G1 {}
class G2 {}
type G = ReturnType<typeof G1>|ReturnType<typeof G2>[]

class I {
  children: G
}
```

```xsd
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="G1">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:length value="0"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:element>

  <xs:element name="G2">
    <xs:simpleType>
      <xs:restriction base="xs:string">
        <xs:length value="0"/>
      </xs:restriction>
    </xs:simpleType>
  </xs:element>

  <xs:complexType name="G">
    <xs:sequence>
      <xs:element ref="G1" minOccurs="0" maxOccurs="unbounded"/>
      <xs:element ref="G2" minOccurs="0" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:element name="I">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="attr" type="G"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

</xs:schema>
```