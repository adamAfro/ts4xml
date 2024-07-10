# DTS2XSD

Deno utility for converting typescript function return types to XSD schema:

- [x] gets all classes from a file as JSON object;
- [x] names of classes are saved;
- [ ] allow and distninguish between classes from different scopes;
- [ ] support nested properties;
- [ ] support `type` keyword for global types;
- [x] properties can:
    - [x] have mixed types;
    - [x] be optional;
    - [x] be arrays;
    - [x] be references to other return types of classes.
- [ ] tranform JSON object to XSD schema;
    - [x] allow implementing attributes inside tags;
    - [ ] allow implementing contens inside tags;
- [ ] allow not supported types to be ignored, with a message;
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

**Testing**:

    deno test --allow-env --allow-read test/run.ts