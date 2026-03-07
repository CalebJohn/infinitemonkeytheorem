
PGraphics back;
float skyhue = 160;
float TOD = 255;
void setup() {
  size(600, 600);
  background(125, 255, 255);
  noiseDetail(6, 0.35);
  colorMode(HSB, 255);
  //Set up circle frame
  back = createGraphics(width, height);
  back.beginDraw();
  back.background(255);
  back.loadPixels();
  for (int i=0; i<width; i++) {
    for (int j=0; j<height; j++) {
      float x = i-width*0.5;
      float y = j-height*0.5;
      if (sqrt(x*x+y*y)<width*0.5) {
        back.pixels[i+j*width] = color 
          (255, 255*smoothstep(width*0.5-2, width*0.5, sqrt(x*x+y*y)));
      }
    }
  }
  back.updatePixels();
  back.endDraw();
//initially the same background/color scheme
background(skyhue, 140, TOD);
  draw_scene();
  fill(0);
  textAlign(CENTER);
  textSize(25);
  text("Click to generate new scene", width*0.5, 75);
}

void draw() {
}

void mouseClicked() {
  skyhue = random(255); 
  //generate TOD weighted towards daytime
  TOD = pow(random(pow(255, 2.0)), 0.5);
  background(skyhue, 140, TOD);
  float sign = (TOD<128)? -1:1;
  //draw gradient
  if (TOD<200) {
    for (int i=0; i<height; i++) {
      stroke(skyhue+sign*sq(float(i)/height)*skyhue*0.25*
        smoothstep(75, 150, TOD), 140, TOD*smoothstep(100, 175, TOD)+TOD*(float(i)/height));
      line(0, i, width, i);
    }
  }
  //draw stars
  if (TOD<75) {
    for (int i=0; i<1000; i++) {
      float s = random(1, 3);
      noStroke();
      fill(255);
      ellipse(random(width), random(height), s, s);
    }
  }
  draw_scene();
}

void keyPressed() {
 save(second()+".png"); 
}
//draw random number of mountains and apply frame
void draw_scene() {
  noStroke();
  float w, h, x, y;
  int num = int(sqrt(random(1, 50)));
  for (int i=0; i<num; i++) {
    w = random(100, 600-i*50);
    h = w*0.5+random(-w*0.2, w*0.2);
    x = random(0, width-w);
    y = height;
    gen_mountain(x, y, w, h);
  }
  image(back, 0, 0); 
}

//takes in a rectangle definition of the size of the mountain
void gen_mountain(float x, float y, float w, float h) {
  int LOD = int(pow(2, int(random(2, 5)))+1);
  //an array representing the offset of the line made by the shadows
  float[] shadowline = new float[LOD];
  float shadow_ratio = random(0.3, 0.98);
  float peak_ratio = random(0.25, 0.75);
  for (int i=0; i<LOD; i++) {
    shadowline[i] = 0;
  }
  float fall = random(0.3, 0.7);
  //adjust falloff when close to edge of mountain
  fall-= 0.3*smoothstep(0.75, 0.9, shadow_ratio);
  //apply midpoint displacement algorithm to the shadow line
  disq(0, LOD, 0, 0, shadowline, 4*(w/300), fall);
  //stroke(0);
  
  //draw white mountain
  beginShape();
  fill(255);
  vertex(x+w, y);
  vertex(x, y);
  vertex(x+peak_ratio*w, y-h);
  endShape(CLOSE);
  
  //draw shadow side of mountain over top
  PVector peak = new PVector(x+peak_ratio*w, y-h);
  PVector sr = new PVector(x+shadow_ratio*w, y);
  beginShape();
  fill(skyhue, 150, TOD*0.5);
  vertex(x+w, y);
  vertex(sr.x, sr.y);
  for (int i=1; i<LOD-1; i++) {
    PVector p = PVector.sub(sr, peak);
    p.div(LOD-1);
    p.mult(float(i));
    PVector q = PVector.sub(sr, peak);
    q.normalize();
    q.set(q.y, q.x);
    q.mult(shadowline[i]);
    q.mult(15);
    vertex(sr.x-p.x+q.x, y-p.y+q.y); 
  }
  vertex(peak.x, peak.y);
  endShape(CLOSE);
}

float smoothstep(float a, float b, float x)
{
  x = constrain((x - a)/(b - a), 0.0, 1.0); 
  return x*x*(3.0 - 2.0*x);
}

//implementation of midpoint displacement algorithm
//includes persistence and lacurnity values
void disq(float x, float w, float h1, float h2, float[] ar, float r, float f) {
  float nw = w*0.5;
  r*=f;
  if (w>1) {
    float midh = (h1+h2)*0.5+random(-r, r);
    disq(x, nw, h1, midh, ar, r, f);
    disq(x+nw, nw, midh, h2, ar, r, f);
  } else {
    ar[int(x)] = (h1+h2)*0.5;
  }
}