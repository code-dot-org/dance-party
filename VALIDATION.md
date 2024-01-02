# Dance Party: Validation Feedback Documentation

Dance levels can include validation feedback configured with `validation_code`. There is a general consensus that many students do not read level instructions carefully so that validation feedback is critical for students to engage successfully with a given activity.

Currently (January 2024), there are two versions of Dance Party progressions:
- [Dance Party (2019)](https://studio.code.org/s/dance-2019) - [script](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/config/scripts_json/dance-2019.script_json)
- [Dance Party: AI Edition (2023)](https://studio.code.org/s/dance-ai-2023) - [script](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/config/scripts_json/dance-ai-2023.script_json)

The following table includes functions and variables that are used in the 2019 Dance Party and/or Dance Party AI Edition progression. The column is checked if the code is used in the respective progression. Note that additional support was added to `code-dot-org/dance-party` for the 2023 AI Edition to provide more targeted feedback for users.

| Name | Description | 2019 Dance | 2023 AI |
| --- | --- | --- | --- |
| `pass()` | A function that is called when a user 'passes' a level |  &check; |  &check; |
| `fail(<validation feedback string key>)` | A function that is called when a user 'fails' a level - the parameter is the [feedback string key](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/i18n/dance/en_us.json) which is displayed to give user's targeted feedback/help | &check; |  &check; |
| `getCurrentPalette()` | A function that returns a string that represents the current background palette | | &check;  |
| `getUserBlockTypes()` | A function that returns an array of strings that represent block type names in a user's program | | &check;  |
| `world.aiBlockCalled` | A boolean that is set `true` if the AI block has been executed and `false` otherwise | | &check;  |
| `world.aiBlockContextUserEventKey` | Used in conjunction with `setFuncContext` - a string that represents the event key ('up', 'down', ...) within the context of when the AI block is executed - Although this variable is not used in the 2019 nor 2023 Dance Party progressions, it could be helpful in future Dance Party progressions. | | &check;  |
| `world.aiBlockHasInvalidParams` | A boolean that is set `true` if the AI block is executed with undefined parameters (emojis) | | &check;  |
| `world.bg_effect` | A string that represents the current background effect | | &check;  |
| `world.fg_effect` | A string that represents the current foreground effect | | &check;  |
| `world.keysPressed` | A set that is assigned strings that represent keys pressed during the running of a user's program | &check; |  &check; |
| `world.spriteGroupsCalledToChangeMove` | An array of strings that represent sprite groups called to change dance move via `changeMoveEachLR` | | &check;  |
| `world.spriteStyles` | An array of strings that represent the sprite costumes that have been added to a user's program | | &check;  |
| `world.validationState` | Object that is used to save state during the running of the user's program for validation purposes, [e.g.](https://github.com/code-dot-org/code-dot-org/blob/34be28fcefbf84f2cefec08e06abff311fc1befa/dashboard/config/levels/custom/dance/Dance_2019_03.level#L34C26-L34C26), `World.validationState[index] = sprite.getAnimationLabel()` | &check; |  &check; |
| `getTime('measures')` | A function that returns a number | &check; |  &check; |
| `setFuncContext(type, key)` | A function defined in `p5.dance.js` and added to `api.js` - this function is called on in `executeFuncs` defined in `p5.dance.interpreted` to set a function's context eventType and event key | | &check;  |
| `sprites` | An array of sprites in a user's program - defined in `api.js` | &check; |  &check; |
| `sprite.current_move` | A number that represents the index of a sprite's current dance move in [`MOVE_NAMES` array](https://github.com/code-dot-org/dance-party/blob/e5dc8698e8700314959e58cb8f45c6a3314c43cc/src/constants.js#L18) | &check; | |
| `sprite.getAnimationLabel()` | A function that returns a string that represents a sprite's current animation, e.g., `anim0` - this function is defined in [`code-dot-org/p5.play`](https://github.com/code-dot-org/p5.play/blob/6b9a6ac479ce38a134cfc2fb9cadd50310741669/lib/p5.play.js#L2949C3-L2949C3) | &check; |  &check; |
| `sprite.scale` | A number that represents the scale of a sprite - `0.3` is the default value for a backup dance and `1.0` is the default value for a lead dancer | &check; | |
| `sprite.tint` | A string that represent the color of a sprite | &check; | |

Note that `world` variables are accessed in `.level` files with `World`, e.g., `World.spriteStyles`, and functions defined in `p5.dance.js` are accessed in `.level` files with `nativeAPI`, e.g., `nativeAPI.pass()`. Functions and variables defined in `api.js` are accessed as is, e.g., `sprites`.

Validation code is usually configured via levelbuilder by content editors. However, Dance Party validation code has been written by engineers because of the lack of documentation and the unfriendly API.

[Link to Dance Party 2019 validation code](https://docs.google.com/document/d/1rZrUCeuy6KIRC8a44reu6QpNTCA_gCxHeDX6IFal96g/edit)  
[Link to Dance Party: AI Edition validation code](https://docs.google.com/document/d/1BErRvFN3lOoJPUMKS_xrbTjDUs55khh2Uwhfvy5SVIs/edit)

When Dance Party is migrated to `lab2`, there is strong interest in revamping validation support so that content editors have better documentation and support in writing validation code more independently.