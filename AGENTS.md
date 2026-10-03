# Space Attack web project

Before handling EVERY project prompt or performing any project action, read [Rules.txt](Rules.txt) in full. Re-read it for each new assignment, including delegated assignments.

The current repository contains workflow scaffolding only. Do not implement the game until requested by the user.

For game implementation, use separate role agents in this order:

1. Producer: read `.agents/skills/space-attack-producer/SKILL.md`; prepare and register the brief.
2. Programmer: read `.agents/skills/space-attack-programmer/SKILL.md`; implement the Producer brief and hand off evidence.
3. Tester / QA: read `.agents/skills/space-attack-qa/SKILL.md`; update and execute `Test List.txt`, then approve delivery or return defects to Producer.

The coordinating agent must pass the implementation ID, project path, brief, and prior handoff to each agent. Assign implementation edits to Programmer and test records to QA sequentially to avoid concurrent edits. Reuse role agents for repair cycles when available. If delegation tools are unavailable, disclose that limitation and apply the same role sequence without claiming independent QA occurred.

Read `Implementation Log.txt` for ongoing work. Record every implementation, repair, and handoff there. QA's verified verdict controls the final delivery status.

