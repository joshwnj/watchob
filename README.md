Watchable Object
====

Requirements
----

- when you create a new object and pass in a state, it must pass by copy not reference
- only single-level keys are supported

### Patches

- whenever a change is made to the object's state, a patch object is created
- patch object signature: `{ rev: string, data: [ type(string), key(string), args:mixed ] }`

- NOTE: `patch.rev` is the head revision of the entire object, at the point in time just prior to applying the patch (not the head revision of the object _after_ applying the patch).
