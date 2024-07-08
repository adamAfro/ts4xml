declare namespace Mixed {

    interface PropEl {}

    interface PropsEl {}

    interface PropsOptEl {}

    interface ArrayEl {}

    interface ArrayPropElTuple {
        various: (string|PropEl|PropsEl|PropsOptEl)[];
    }
}