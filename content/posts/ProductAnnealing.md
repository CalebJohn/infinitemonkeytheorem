Title: Product Annealing
Date: 2022-11-14 00:00
Tags: research, optimization
Keywords: research, optimization, product
Authors: Caleb
Summary: Framing new projects as optimization problems


Starting a new project is difficult. Really difficult. You don't necessarily know what your actual product will be[: Finding product/market fit is **hard**]. Ideally you would arrive at the final solution quickly, and iterate from there. For example, you might have decided that the existing secure messaging tools (signal et. al.) are insufficient and you will build your own. At this stage, you don't know if the communication will be P2P, centralized, or federated (or some combination). You don't know what crypto to use (is AES-256 still secure?). To what extent should it leverage blockchain technology? Does it need to be quantum-hardened? Will it use a push or pull model? etc. 

This is a common position to be in when you're not a domain expert (and sometimes even if you are) and will occur on a project of any scale. Even building a modest CRUD app will require you to be familiar with multiple technology stacks (frontend/backend), the trade-offs between databases, and the different hosting options. 

Put differently, you want to find the optimal solution for your project (i.e. optimal technologies, optimal feature set, etc.) as quickly as possible. Thus you should employ an optimization technique.

I propose Simulated Annealing[^1]. The name comes from the metallurgical process of annealing, which involves heating, then slowly cooling a material. For example, glass is annealed to provide a uniform rigid structure, glass that is improperly annealed will contain internal stress points making it fragile.

Simulated Annealing uses an internal "temperature" or "energy", which is intuitively understood as the willingness of the algorithm to jump around the search space. The "temperature" is slowly lowered until the algorithm (hopefully) settles on the global optimum. If the temperature is lowered too quickly the algorithm will settle on a local maximum (the probability of finding a global optimum approaches 1 as annealing time increases), lowering to slowly wastes compute time.

When starting a new project, I suggest keeping the annealing metaphor in mind. Early on the project should be in a high "temperature" state. This means testing out and researching many solutions without commitment. As time progresses the "temperature" should decrease, resulting in less broad solution changes, and more refinements on a few chosen solutions. Eventually, the system should be in a state with very few changes, and primarily refinements as requirements change/issues are discovered.

This is not an exact prescription to be followed[: In the case of a new project where you are already familiar with the space, it might make sense to start from a lower "temperature" for example. ], but I believe the following lessons are important to keep in mind.

1. The start of a new project requires a lot of energy  
    - It's important to spend this time experimenting and researching many diverse solutions to the problem at hand. Don't commit (or over-commit) to anything at this point. This means that discovering a flaw in a critical dependency should not result in the death of the project.
   
2. Reduce the "temperature" with time  
    - It's never too late to make modifications to a project, but as time goes on changes should get smaller. Stability is important.
   
3. Don't let the "temperature" reach 0  
    - Even though the "temperature" of the project is always trending down, remember that it should never reach absolute zero[^2]; there is always room to correct technological mistakes.


[^1]: https://en.wikipedia.org/wiki/Simulated_annealing
[^2]: https://en.wikipedia.org/wiki/Absolute_zero
