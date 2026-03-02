Title: Rust is the New C
Date: 2026-03-02 00:00
Tags: thoughts
Keywords: rust, c, pl, programming
Authors: Caleb
Summary: The evolution of programming continues


Hear me out. Newer languages (assembler -> C[:I know other languages pre-date C, please bear with me for colour] or C -> rust) often provide a transition from an unconstrained environment to a more constrained environment, with a significant boost in the compilers ability to detect bugs. This transition from unconstrained to constrained is always irritating for some [:For a wonderful example of this, see [The Story of Mel](https://users.cs.utah.edu/~elb/folklore/mel.html)], but eliminates an entire class of bug. Let me explain.

C codifies some specific patterns, and in doing so adds guardrails around what can be done. I think this is best described with the `while` loop. Check this pseudo-assembler

```asm
    MOV $R0, 10 // r0 = 10
start:
    CMP $R0, 0  // result = (r0 == 0)
    JE end      // if result is true: goto end
    SUB $R0, 1  // r0 -= 1
    JMP start   // goto start
end:
    // fin
```

This isn't the only way it could be written [:In fact, this is not real code so it can't be written that way!]. The interesting point about the above code is that each line needs to be in this relative order or things fall apart quickly. For example, if you forget the comparison, you'll be able to run the code, but it's basically a 50-50 chance of either skipping the loop or entering an infinite loop. The same can happen if the variable initialization is missing, or the jump if equal (`JE`) is missing. 

```asm
    MOV $R0, 10 // r0 = 10
start:
    // result is picked up from its last use
    JE end      // if result is true: goto end
    SUB $R0, 1  // r0 -= 1
    JMP start   // goto start
end:
    // might reach this immediately, or never
```

Now we look at how this loop is (typically) written in C.

```c
int x = 10;
while (x != 0) {
  x--;
}
```

If any parts, except the loop body [:Nobody said that C is perfect], are missing the compiler will complain and assist the programmer with fixing the bug [:Assistance levels will vary]. This is a move that limits what the programmer can do, but the tradeoff is the compiler can be more helpful.

The power of assembler here is that the loop can be modified to get different behaviour without deviating from the norms of the language. For example, if the author felt like inserting some code between the `CMP` and the `JE` they would be free to do that. This would be a useful pattern to include code that needs to be run whether or not the loop exits. To get the equivalent behaviour in C, you would most likely use an infinite loop with a break condition. This allows a C user to get the same benefit, but they lose the ability for the compiler to infer useful things and help them prevent bugs. 

<details>
    <summary>Inserting between "`CMP` and `JE`" in C</summary>

I will note that I could not come up with an interesting example, so please enjoy this placeholder comment.

```c
int x = 10;
bool result = false;
while (1) {
    result = x == 0;
    // Fancy things go here
    if (result) {
        break;
    }
    x--;
}
```
</details>

The value of moving from assembler to C is not just code organization and expressiveness, it's the ability to constrain code in such a way that the compiler can help catch bugs. You can see a similar transition with Rust, not just in terms of having nice code patterns (enums, iterators, etc.) but in having the borrow checker, which fundamentally limits the things that a programmer can do in exchange for a reduction in bugs [:In this case it's a more abstract from what's visibly on the screen, but no less important things like mutable aliasing, use-after-free, data races, and double frees].

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4); // Compiler error: cannot borrow `v` as mutable
println!("{}", first); // `first` may point to freed memory
```

The equivalent C code compiles without complaint, but `push` could reallocate the vector's backing memory, leaving `first` as a dangling pointer. Rust's borrow checker sees that `first` holds an immutable reference to `v`, and refuses to let you mutate `v` until that reference is no longer in use. Some programmers see this as overly restricting, and others find freedom in trusting the compiler to catch this kind of error.

Sorry for the clickbait title, Rust isn't the new C, but it does follow the same trend of trading programmer freedom in exchange for compiler-assisted safety.
