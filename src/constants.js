module.exports = {
  SIZE: 300,
  FRAMES: 24,
  SPRITE_NAMES: ["ALIEN", "BEAR", "CAT", "DOG", "DUCK", "FROG", "MOOSE", "PINEAPPLE", "ROBOT", "SHARK", "SLOTH", "UNICORN"],
  MOVE_NAMES: [
    {name: "Rest", mirror: true, rest: true},
    {name: "ClapHigh", mirror: true},
    {name: "Clown", mirror: false, burstReversed: true},
    {name: "Dab", mirror: true},
    {name: "DoubleJam", mirror: false, burstReversed: true},
    {name: "Drop", mirror: true},
    {name: "Floss", mirror: true, burstReversed: true},
    {name: "Fresh", mirror: true},
    {name: "Kick", mirror: true, burstReversed: true},
    {name: "Roll", mirror: true, burstReversed: true},
    {name: "ThisOrThat", mirror: false, burstReversed: true},
    {name: "Thriller", mirror: true, burstReversed: true},
    {name: "XArmsSide", mirror: false, shortBurst: true},
    {name: "XArmsUp", mirror: false, shortBurst: true},
    {name: "XJump", mirror: false, shortBurst: true},
    {name: "XClapSide", mirror: false, shortBurst: true},
    {name: "XHeadHips", mirror: false, shortBurst: true, burstReversed: true},
    {name: "XHighKick", mirror: false, shortBurst: true},
    {name: "XBend", mirror: false, shortBurst: true},
    {name: "XFever", mirror: false, shortBurst: true},
    {name: "XHop", mirror: false, shortBurst: true},
    {name: "XKnee", mirror: false, shortBurst: true},
    {name: "XKneel", mirror: false, shortBurst: true},
    {name: "XOle", mirror: false, shortBurst: true},
    {name: "XSlide", mirror: false, shortBurst: true},
  ],
  RANDOM_EFFECT_KEY: 'rand',
  BACKGROUND_EFFECTS: [
    'circles',
    'color_cycle',
    'diamonds',
    'disco_ball',
    'fireworks',
    'swirl',
    'kaleidoscope',
    'lasers',
    'splatter',
    'rainbow',
    'snowflakes',
    'text',
    'galaxy',
    'sparkles',
    'spiral',
    'disco',
    'stars',
    'music_wave',
    'ripples',
    'ripples_random',
    'quads',
    'flowers',
    'squiggles',
    'growing_stars'
  ],
  FOREGROUND_EFFECTS: [
    'bubbles',
    'confetti',
    'hearts_red',
    'music_notes',
    'pineapples',
    'pizzas',
    'smiling_poop',
    'rain',
    'floating_rainbows',
    'smile_face',
    'spotlight',
    'color_lights',
    'raining_tacos',
    'emojis',
    'hearts_colorful',
    'exploding_stars',
    'paint_drip'
  ],
  PALETTES: {
    default: ['#ffa899', '#99aaff', '#99ffac', '#fcff99', '#ffdd99'],
    electronic: ['#fc71ee', '#3f0f6e', '#030a24', '#222152', '#00f7eb'],
    vintage: ['#594c51', '#97bcb2', '#f1ebc4', '#e9b76f', '#de6965'],
    cool: ['#2b5ef6', '#408ae1', '#69d5fb', '#6ee4d4', '#7afaae'],
    warm: ['#ba2744', '#d85422', '#ed7c49', '#f1a54b', '#f6c54f'],
    iceCream: ['#f6ccec', '#e2fee0', '#6784a6', '#dfb48d', '#feffed'],
    tropical: ['#eb6493', '#72d7fb', '#7efaaa', '#fffe5c', '#ee8633'],
    neon: ['#e035a1', '#a12dd3', '#58b0ed', '#75e847', '#fdf457'],
    rave: ['#000000', '#5b6770', '#c6cacd', '#e7e8ea', '#ffffff'],
  },

  HIGHER_POWER_COLOR: {
    default: '#2143C5', // dark blue (UI says light)
    electronic:'#5B8493', // dark teal
    vintage: '#B5855C', // light brown
    cool: '#242E32', // dark grey
    warm: '#EB9629', // gold
    iceCream: '#66605E', // light grey
    tropical: '#D32842', // red
    neon:  '#210C1A', // dark purple
    rave: '#000000' // black (UI says black and white)
  }
};
