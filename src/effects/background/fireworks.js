const drawSparkle = require('../../shapes/sparkle');

module.exports = function (p5, randomColorFromPalette, randomNumber) {
  return {
    particles: [],
    minExplosion: 20,
    maxExplosion: 50,
    minPotential: 200,
    maxPotential: 300,
    buffer: null,

    makeParticle: function (type, pos, vel, color, potential) {
      return {
        type: type,
        pos: pos,
        vel: vel,
        gravity: p5.createVector(0.0, 0.1),
        potential: potential,
        acc: p5.createVector(0, 0),
        color: color,
        alpha: 1,
        update: function () {
          this.acc.add(this.gravity);
          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0, 0);
        },
      };
    },

    init: function () {
      if (this.buffer) {
        return;
      }
      // We get the tracer effect by writing frames to a
      // off-screen buffer that has a transparent background.
      this.buffer = p5.createGraphics(p5.width, p5.height);
    },

    draw: function () {
      p5.background(0);
      this.buffer.background(0, 25);

      p5.push();
      this.drawParticles();

      // Copy the off-screen buffer to the canvas.
      p5.scale(1 / p5.pixelDensity());
      p5.drawingContext.drawImage(this.buffer.elt, 0, 0);

      p5.pop();

      this.particles = this.nextParticles();
    },

    drawParticles: function () {
      for (var i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];
        p.update();

        this.buffer.push();
        if (p.type === 'rocket') {
          this.buffer.strokeWeight(3);
          this.buffer.stroke(p.color);
          this.buffer.point(p.pos.x, p.pos.y);
        } else if (p.type === 'particle') {
          this.buffer.translate(p.pos.x, p.pos.y);
          this.buffer.drawingContext.globalAlpha = p.alpha;
          p.alpha = p5.constrain(p.alpha - 0.02, 0, 1);
          drawSparkle(this.buffer.drawingContext, p.color);
        }
        this.buffer.pop();
      }
    },

    nextParticles: function () {
      let ret = [];

      // total potential is the number of particles active, or the number represented
      // in unexploded rockets. This is how we manage total number of objects
      var totalPotential = 0;
      for (var i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];

        if (p.type === 'rocket') {
          // explode a rocket when it reaches it peak height
          if (p.vel.y <= 0) {
            ret.push(p);
          } else {
            ret = ret.concat(this.explode(p));
          }

          // the rocket exploded to its potential or its still waiting
          totalPotential += p.potential;
        } else if (p.type === 'particle') {
          // remove things when they leave the window, except allow particles
          // to fall back down into the view from above
          if (p.pos.x > 0 && p.pos.x < p5.width && p.pos.y < p5.height) {
            ret.push(p);
            totalPotential += p.potential;
          }
        }
      }

      // make sure the total potential for particles is between the min and max potential
      if (totalPotential < this.minPotential) {
        // fire rockets until we fill the potential
        while (totalPotential < this.maxPotential) {
          let p = this.makeParticle(
            'rocket',
            p5.createVector(randomNumber(0, p5.height), p5.width),
            p5.createVector(0, p5.random(-9, -7)),
            randomColorFromPalette(),
            p5.random(this.minExplosion, this.maxExplosion)
          );
          totalPotential += p.potential;
          ret.push(p);
        }
      }
      return ret;
    },

    explode: function (p) {
      let ret = [];
      for (var i = 0; i < p.potential; i++) {
        ret.push(
          this.makeParticle(
            'particle',
            p5.createVector(p.pos.x, p.pos.y),
            p5.createVector(p5.random(-5, 5), p5.random(-5, 5)),
            p.color,
            1
          )
        );
      }
      return ret;
    },
  };
};
