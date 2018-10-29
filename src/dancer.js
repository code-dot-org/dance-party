const data = [
  `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><path fill="none" stroke="#5E79BC" stroke-linecap="round" stroke-linejoin="round" stroke-width="38" d="M429 705l-1-115-1-116"/><g><g><path fill="none" stroke="#5E79BC" stroke-linecap="round" stroke-linejoin="round" stroke-width="38" d="M375 705l-1-115-1-116"/></g></g><g><path fill="#5E79BB" d="M459 459a59 59 0 1 1-118 0 59 59 0 0 1 118 0z"/><path fill="#66342C" d="M352 336a48 48 0 1 1 96 0v89h-96v-89z"/><path fill="#301A12" d="M433 301l-10-7v52h-45v-53c-3 2-7 4-9 7v46h-17v79h96v-79h-15v-45z"/></g><g><g><path fill="none" stroke="#66342D" stroke-linecap="round" stroke-linejoin="round" stroke-width="34" d="M475 498s11-66 7-92c-3-25-32-86-32-86"/></g></g><g clip-path="url(#cp_VS0kms6r)" transform="matrix(.8 0 0 .8 199 32)"><path fill="#D0AC9A" d="M194 136c8-4 18-2 22 6l7 11a16 16 0 0 1-29 16l-6-10c-5-8-2-18 6-23z"/><path fill="none" stroke="#66342C" stroke-width="11.303" d="M194 136c8-4 18-2 22 6l7 11a16 16 0 0 1-29 16l-6-10c-5-8-2-18 6-23z"/><path fill="#66342C" d="M192 116a33 33 0 1 1 0 66 33 33 0 0 1 0-66z"/><path fill="#D0AC9A" d="M192 132a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"/><path fill="#66342C" d="M307 116a33 33 0 1 1 0 66 33 33 0 0 1 0-66z"/><path fill="#D0AC9A" d="M307 132a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"/><path fill="#B556A0" d="M250 135a110 110 0 1 1 0 221 110 110 0 0 1 0-221z"/><path fill="#66342C" d="M250 146a107 107 0 1 1 0 215 107 107 0 0 1 0-215z"/><path fill="#B556A0" d="M262 140l-34 22v-44l34 22z"/><path fill="#B556A0" d="M238 140l34-22v44l-34-22z"/><path fill="#D0AC9A" d="M250 347c32 0 58-25 58-57H193c0 32 26 57 57 57z"/><path fill="#D0AC9A" d="M308 290c0 11-9 20-20 20h-75a20 20 0 0 1 0-40h75c11 0 20 9 20 20z"/><path fill="#301A12" d="M250 307c13 0 24-11 24-24h-47c0 13 10 24 23 24z"/><path fill="#301A12" d="M274 283c0 5-4 8-8 8h-31a8 8 0 0 1 0-16h31c4 0 8 4 8 8z"/><path d="M216 226l5-8a3 3 0 1 1 4 3l-5 8c5 4 7 10 7 16a4 4 0 0 1-7 0c-1-8-7-14-14-14-8 0-14 6-14 14a4 4 0 0 1-8 0c0-6 3-12 8-16l-5-8c-1-2 0-3 1-4s3 0 4 1l4 8c2-2 5-2 8-3v-9a3 3 0 1 1 5 0v9l7 3z"/><path fill="none" stroke="#000" stroke-width="1.1303" d="M216 226l5-8a3 3 0 1 1 4 3l-5 8c5 4 7 10 7 16a4 4 0 0 1-7 0c-1-8-7-14-14-14-8 0-14 6-14 14a4 4 0 0 1-8 0c0-6 3-12 8-16l-5-8c-1-2 0-3 1-4s3 0 4 1l4 8c2-2 5-2 8-3v-9a3 3 0 1 1 5 0v9l7 3z"/><g><path d="M290 223v-9a3 3 0 1 1 5 0v9c3 1 6 1 8 3l4-8a3 3 0 1 1 5 3l-5 8c5 4 8 10 8 16a4 4 0 0 1-8 0c0-8-6-14-14-14-7 0-13 6-14 14a4 4 0 0 1-7 0c0-6 2-12 7-16l-5-8c-1-2-1-3 1-4 1-1 3 0 3 1l5 8 7-3z"/><path fill="none" stroke="#000" stroke-width="1.1303" d="M290 223v-9a3 3 0 1 1 5 0v9c3 1 6 1 8 3l4-8a3 3 0 1 1 5 3l-5 8c5 4 8 10 8 16a4 4 0 0 1-8 0c0-8-6-14-14-14-7 0-13 6-14 14a4 4 0 0 1-7 0c0-6 2-12 7-16l-5-8c-1-2-1-3 1-4 1-1 3 0 3 1l5 8 7-3z"/></g></g><g><g><path fill="none" stroke="#66342D" stroke-linecap="round" stroke-linejoin="round" stroke-width="34" d="M325 498s-11-66-7-92c3-25 32-86 32-86"/></g></g></svg>`,
];

module.exports = class Dancer {
  constructor() {
    this.defaultWidth = 300;
    this.defaultHeight = 300;

    this.frames = data.map(dataUrl => {
      const i = new Image();
      i.src = dataUrl;
      return i;
    });
  }

  drawPose(ctx, centerX, centerY, scaleX = 1, scaleY = 1, tint = null) {
    ctx.drawImage(this.frames[0], centerX - this.defaultWidth / 2, centerY - this.defaultHeight / 2, this.defaultWidth * scaleX, this.defaultHeight * scaleY);
  }
};
