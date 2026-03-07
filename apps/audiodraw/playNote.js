function playNote(duration, frequency, envelope)
{
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  var sr = audioCtx.sampleRate;
  var frameCount = sr * duration;

  // Prevent crackling at beginning and end by always moving to zero
  envelope.unshift([envelope[0][0] - 30, 0]);
  envelope.push([envelope[envelope.length - 1][0] + 30, 0]);
  
  var buff = audioCtx.createBuffer(1, frameCount, sr);
  
  var nowBuffering = buff.getChannelData(0);
  var e = 0;
  var f = 0;
  for (var i = 0; i < frameCount; i++) {
    var nx = trackPos(envelope, e + 1);
    var x = trackPos(envelope, e);
    var nf = trackPos(frequency, f + 1);
    var cf = trackPos(frequency, f);
    var c = (i / frameCount - x) / (nx - x);
    var amp = amplitude(envelope, e, c);
    var fc = (i / frameCount - cf) / (nf - cf);
    var freq = amplitude(frequency, f, fc);
    nowBuffering[i] = amp * Math.sin(i / sr * freq * 2 * Math.PI);
    if (e <= envelope.length && c >= 1) {
      e++;
    }
    if (f <= frequency.length && fc >= 1) {
      f++;
    }
  }
  
  var source = audioCtx.createBufferSource();
  source.buffer = buff;
  source.connect(audioCtx.destination);
  source.start(0);
  source.stop(duration);
  // Some systems have a limited number of audio contexts available
  setTimeout(function() {
    audioCtx.close();
  }, duration * 1000);
}

function trackPos(envelope, e)
{
  return (envelope[e][0] - envelope[0][0]) / (envelope[envelope.length - 1][0] - envelope[0][0]);
}

function amplitude(envelope, index, c)
{
  return lerp(envelope[index][1], envelope[index + 1][1], c);
}

function lerp(a, b, t)
{
  return a + t * (b - a);
}

