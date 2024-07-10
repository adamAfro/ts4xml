# DTS2XSD

Deno utility for converting typescript interfaces to XSD schema:

- [x] gets all interfaces from a file as JSON object;
- [x] names of interfaces are saved;
- [ ] does not treat all nested interfaces as 1st level;
- [ ] support nested properties;
- [ ] support `type` keyword for global types;
- [x] properties can:
    - [x] have mixed types;
    - [x] be optional;
    - [x] be arrays;
    - [x] be references to other interfaces.
- [ ] tranform JSON object to XSD schema;
    - [x] allow implementing attributes inside tags;
    - [ ] allow implementing contens inside tags;
- [ ] allow not supported interfaces to be ignored, with a message;
- [ ] allow setting up `children` name.

**Supported features**:

* simple type property;
* optional simple type property;
* text and number literals;
* array properties;
* multiple interfaces;
* empty element;
* element with text as children;
* element with other element as children;
* both string property and children;
* multiple elements;
* multiple elements and text;
* multiple elements and text (ignoring other simple types);


See [test](test/readme.md) for implemented features with
generic unit cases.

**Good practices**:

- use only simple types and object with simple types;
- do not use functions;
- do not use nested interfaces;
- do not use nested properties at all.

**Testing**:

    deno test --allow-env --allow-read test/run.ts