module.exports = function drawRainbow(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, 0);
  ctx.lineTo(20, 10);
  ctx.lineTo(0, 10);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = '#dd527c';
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.bezierCurveTo(4.822, 0, 0.564, 3.935, 0.052, 8.978);
  ctx.bezierCurveTo(0.017, 9.314, 0, 9.655, 0, 10);
  ctx.lineTo(6, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 3.141592653589793, 6.283185307179586, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(20, 10);
  ctx.bezierCurveTo(20, 4.477, 15.523, 0, 10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#febe40';
  ctx.beginPath();
  ctx.moveTo(10, 1);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 9, -1.5707963267948966, 0, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(14, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 0, -3.141592653589793, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(1, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 9, 3.141592653589793, 4.71238898038469, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#fff79c';
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 8, -1.5707963267948966, 0, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(14, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 0, -3.141592653589793, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(2, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 8, 3.141592653589793, 4.71238898038469, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#8fc23f';
  ctx.beginPath();
  ctx.moveTo(10, 3);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 7, -1.5707963267948966, 0, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(14, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 0, -3.141592653589793, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(3, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 7, 3.141592653589793, 4.71238898038469, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#30b1ad';
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 6, -1.5707963267948966, 0, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(14, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 0, -3.141592653589793, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(4, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 6, 3.141592653589793, 4.71238898038469, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#5e79bc';
  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 5, -1.5707963267948966, 0, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(14, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 4, 0, -3.141592653589793, 1);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.lineTo(5, 10);
  ctx.translate(10, 10);
  ctx.rotate(0);
  ctx.scale(1, 1);
  ctx.arc(0, 0, 5, 3.141592653589793, 4.71238898038469, 0);
  ctx.scale(1, 1);
  ctx.rotate(0);
  ctx.translate(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
};
