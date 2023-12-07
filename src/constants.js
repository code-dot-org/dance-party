module.exports = {
  SIZE: 300,
  FRAMES: 24,
  SPRITE_NAMES: [
    'ALIEN',
    'BEAR',
    'CAT',
    'DOG',
    'DUCK',
    'FROG',
    'MOOSE',
    'PINEAPPLE',
    'ROBOT',
    'SHARK',
    'SLOTH',
    'UNICORN',
  ],
  MOVE_NAMES: [
    {name: 'Rest', mirror: true, rest: true},
    {name: 'ClapHigh', mirror: true},
    {name: 'Clown', mirror: false, burstReversed: true},
    {name: 'Dab', mirror: true},
    {name: 'DoubleJam', mirror: false, burstReversed: true},
    {name: 'Drop', mirror: true},
    {name: 'Floss', mirror: true, burstReversed: true},
    {name: 'Fresh', mirror: true},
    {name: 'Kick', mirror: true, burstReversed: true},
    {name: 'Roll', mirror: true, burstReversed: true},
    {name: 'ThisOrThat', mirror: false, burstReversed: true},
    {name: 'Thriller', mirror: true, burstReversed: true},
    {name: 'XArmsSide', mirror: false, shortBurst: true},
    {name: 'XArmsUp', mirror: false, shortBurst: true},
    {name: 'XJump', mirror: false, shortBurst: true},
    {name: 'XClapSide', mirror: false, shortBurst: true},
    {name: 'XHeadHips', mirror: false, shortBurst: true, burstReversed: true},
    {name: 'XHighKick', mirror: false, shortBurst: true},
    {name: 'XBend', mirror: false, shortBurst: true},
    {name: 'XFever', mirror: false, shortBurst: true},
    {name: 'XHop', mirror: false, shortBurst: true},
    {name: 'XKnee', mirror: false, shortBurst: true},
    {name: 'XKneel', mirror: false, shortBurst: true},
    {name: 'XOle', mirror: false, shortBurst: true},
    {name: 'XSlide', mirror: false, shortBurst: true},
  ],
  RANDOM_EFFECT_KEY: 'rand',
  BACKGROUND_EFFECTS: [
    'blooming_petals',
    'circles',
    'clouds',
    'color_cycle',
    'diamonds',
    'disco',
    'disco_ball',
    'fireworks',
    'flowers',
    'frosted_grid',
    'galaxy',
    'growing_stars',
    'kaleidoscope',
    'lasers',
    'music_wave',
    'quads',
    'rainbow',
    'ripples',
    'ripples_random',
    'snowflakes',
    'sparkles',
    'spiral',
    'splatter',
    'squiggles',
    'starburst',
    'stars',
    'swirl',
    'text'
  ],
  FOREGROUND_EFFECTS: [
    'bubbles',
    'color_lights',
    'confetti',
    'emojis',
    'exploding_stars',
    'floating_rainbows',
    'hearts_colorful',
    'hearts_red',
    'music_notes',
    'paint_drip',
    'pineapples',
    'pizzas',
    'rain',
    'raining_tacos',
    'smile_face',
    'smiling_poop',
    'spotlight'
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
    // Color palettes from poetry lab - a few of the color values have been changed
    // so that the sprite dancers are more visible or 'pop' against the background.
    grayscale: ['#000000', '#333333', '#626C7D', '#999999', '#CCCCCC', '#EEEEEE', '#FFFFFF'],
    sky: ['#3878A4', '#82A9B1', '#ECCEC4', '#F8B8A8', '#E4929C', '#7D7095'],
    ocean: ['#82A9B1', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
    sunrise: ['#F5DC72', '#FC9103', '#F48363', '#F15C4C', '#372031'],
    sunset: ['#530075', '#921499', '#E559BB', '#F7B9DD', '#307087', '#123F50'],
    spring: ['#303F06', '#385202', '#547607', '#85AF4C', '#C1E876', '#D7FF6B'],
    summer: ['#FAD0AE', '#F69F88', '#EE6E51', '#BC4946', '#425D19', '#202E14'],
    autumn: ['#484F0C', '#AEA82E', '#F5DC72', '#D46324', '#731B31', '#4A173C'],
    winter: ['#EAECE8', '#E3DDDF', '#D3CEDC', '#A2B6BF', '#626C7D', '#809EC5'],
    twinkling: ['#F5DC72', '#FC9103', '#BF623C', '#B83604', '#7E1301'],
    rainbow: ['#A800FF', '#0079FF', '#00F11D', '#FF7F00', '#FF0900'],
    roses: ['#4C0606', '#86003C', '#E41F7B', '#FF8BA0 ', '#FFB6B3'],
  },
  // Please DO NOT UPDATE these colors.
  // They were chosen specifically for this theme and should not be changed.
  HIGHER_POWER_COLORS: {
    default: ['#161317', '#2143C5'], // Light color palette: black to blue
    electronic: ['#3C0A92', '#111111'], // purple to black
    vintage: ['#310B66', '#411573'], // all purple
    cool: ['#161317', '#6820A6'], // black to purple
    warm: ['#A00B64', '#121212'], // magenta to black
    iceCream: ['#366EC7', '#1D80A7'], // all cyan
    tropical: ['#571593', '#6820A6'], // all light purple
    neon: ['#2143C5', '#161317'], // blue to black
    rave: ['#171717', '#1B1B1B'], // black and white: all black
    grayscale: ['#171717', '#1B1B1B'], // black and white: all black
    sky: ['#366EC7', '#1D80A7'], // all cyan
    ocean: ['#161317', '#2143C5'], // black to blue
    sunrise: ['#571593', '#6820A6'], // all light purple
    sunset: ['#310B66', '#411573'], // all purple
    spring: ['#366EC7', '#1D80A7'], // all cyan
    summer: ['#571593', '#6820A6'], // all light purple
    autumn: ['#3C0A92', '#111111'], // purple to black
    winter: ['#2143C5', '#161317'], // blue to black
    twinkling: ['#571593', '#6820A6'], // all light purple
    rainbow: ['#161317', '#6820A6'], // black to purple
    roses: ['#A00B64', '#121212'], // magenta to black
  },
  KEY_WENT_DOWN_EVENT_TYPE: 'this.p5_.keyWentDown',
};
