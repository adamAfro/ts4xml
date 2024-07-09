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
    - [ ] allow implementing contens inside tags.

**Good practices**:

- use only simple types and object with simple types;
- do not use functions;
- do not use nested interfaces;
- do not use nested properties at all.

**Testing**:

    deno test --allow-env --allow-read test/run.ts