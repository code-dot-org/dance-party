module.exports = function drawMusicNote(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 0);
  ctx.lineTo(16, 12);
  ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = '#143441';
  ctx.beginPath();
  ctx.moveTo(4.706, 1.024);
  ctx.bezierCurveTo(4.706, 0.458, 5.23, 0, 5.874, 0);
  ctx.lineTo(14.832, 0);
  ctx.bezierCurveTo(15.477, 0, 16, 0.458, 16, 1.024);
  ctx.lineTo(16, 9.389);
  ctx.bezierCurveTo(15.954, 10.838, 14.603, 12, 12.945, 12);
  ctx.bezierCurveTo(11.258000000000001, 12, 9.89, 10.797, 9.89, 9.312);
  ctx.bezierCurveTo(
    9.89,
    7.827999999999999,
    11.258000000000001,
    6.625,
    12.945,
    6.625
  );
  ctx.bezierCurveTo(13.555, 6.625, 14.122, 6.782, 14.599, 7.052);
  ctx.lineTo(14.599, 1.735);
  ctx.lineTo(6.108, 1.735);
  ctx.lineTo(6.108, 9.215);
  ctx.lineTo(6.109999999999999, 9.312);
  ctx.bezierCurveTo(6.11, 10.797, 4.742, 12, 3.055, 12);
  ctx.bezierCurveTo(1.3680000000000003, 12, 0, 10.797, 0, 9.312);
  ctx.bezierCurveTo(0, 7.827999999999999, 1.368, 6.625, 3.055, 6.625);
  ctx.bezierCurveTo(3.6630000000000003, 6.625, 4.23, 6.781, 4.706, 7.051);
  ctx.lineTo(4.706, 1.024);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#143441';
  ctx.beginPath();
  ctx.moveTo(5.874, 0);
  ctx.bezierCurveTo(5.23, 0, 4.706, 0.458, 4.706, 1.024);
  ctx.lineTo(4.706, 7.05);
  ctx.translate(3.0713425115256543, 9.97296012551912);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 3.349, -1.0608812123956128, -1.5756761644736175, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-3.0713425115256543, -9.97296012551912);
  ctx.bezierCurveTo(1.368, 6.625, 0, 7.828, 0, 9.312);
  ctx.bezierCurveTo(0, 10.797, 1.368, 12, 3.055, 12);
  ctx.bezierCurveTo(4.742, 12, 6.11, 10.797, 6.11, 9.312);
  ctx.bezierCurveTo(6.11, 9.28, 6.11, 9.247, 6.1080000000000005, 9.215);
  ctx.lineTo(6.1080000000000005, 1.7349999999999994);
  ctx.lineTo(14.598, 1.7349999999999994);
  ctx.lineTo(14.598, 7.052);
  ctx.translate(12.961553823086197, 9.973959087678026);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 3.349, -1.0602691634285102, -1.5757392621473125, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-12.961553823086197, -9.973959087678026);
  ctx.bezierCurveTo(11.258000000000001, 6.625, 9.89, 7.828, 9.89, 9.312);
  ctx.bezierCurveTo(
    9.89,
    10.796999999999999,
    11.258000000000001,
    12,
    12.945,
    12
  );
  ctx.bezierCurveTo(14.603, 12, 15.954, 10.838000000000001, 16, 9.39);
  ctx.lineTo(16, 1.023);
  ctx.bezierCurveTo(16, 0.458, 15.477, 0, 14.832, 0);
  ctx.lineTo(5.874, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#7d8e9e';
  ctx.beginPath();
  ctx.moveTo(2.091, 7.25);
  ctx.bezierCurveTo(
    2.693542662065396,
    7.25,
    3.1820000000000004,
    7.6815975011631155,
    3.1820000000000004,
    8.214
  );
  ctx.bezierCurveTo(
    3.1820000000000004,
    8.746402498836886,
    2.693542662065396,
    9.178,
    2.091,
    9.178
  );
  ctx.bezierCurveTo(
    1.4884573379346044,
    9.178,
    1.0000000000000002,
    8.746402498836886,
    1.0000000000000002,
    8.214
  );
  ctx.bezierCurveTo(
    1.0000000000000002,
    7.6815975011631155,
    1.4884573379346044,
    7.25,
    2.091,
    7.25
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#7d8e9e';
  ctx.beginPath();
  ctx.moveTo(12.091, 7.25);
  ctx.bezierCurveTo(
    12.693542662065395,
    7.25,
    13.181999999999999,
    7.6815975011631155,
    13.181999999999999,
    8.214
  );
  ctx.bezierCurveTo(
    13.181999999999999,
    8.746402498836886,
    12.693542662065395,
    9.178,
    12.091,
    9.178
  );
  ctx.bezierCurveTo(
    11.488457337934603,
    9.178,
    11,
    8.746402498836886,
    11,
    8.214
  );
  ctx.bezierCurveTo(
    11,
    7.6815975011631155,
    11.488457337934603,
    7.25,
    12.091,
    7.25
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#7d8e9e';
  ctx.beginPath();
  ctx.moveTo(5.75, 0.25);
  ctx.lineTo(14.25, 0.25);
  ctx.quadraticCurveTo(14.5, 0.25, 14.5, 0.5);
  ctx.lineTo(14.5, 0.5);
  ctx.quadraticCurveTo(14.5, 0.75, 14.25, 0.75);
  ctx.lineTo(5.75, 0.75);
  ctx.quadraticCurveTo(5.5, 0.75, 5.5, 0.5);
  ctx.lineTo(5.5, 0.5);
  ctx.quadraticCurveTo(5.5, 0.25, 5.75, 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
};
