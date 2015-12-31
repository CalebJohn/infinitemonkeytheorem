ArrayList<osc> oscs = new ArrayList<osc>();
ArrayList<dial> connected = new ArrayList<dial>();
ArrayList<dial> scattered = new ArrayList<dial>();
void setup()
{
  size(700, 600);
 /* for (int i=0;i<300;i++)
  {
    oscs.add(new osc(new PVector((3*i), 300), 2+(0.1*i))); 
  }*/
  for(float i=0; i<4*PI;i+=0.1)
  {
    connected.add(new dial(i, i/2, new PVector(width/3, height/2))); 
  }
  for(float i=0; i<2*PI;i+=0.1)
  {
    scattered.add(new dial(i, i, new PVector(2*width/3, height/2))); 
  }
}

void draw()
{
  background(255);
  for (int i = 1;i<connected.size();i++)
  {
    connected.get(i).update();
    stroke(0);
    line(connected.get(i-1).go().x, connected.get(i-1).go().y, connected.get(i).go().x, connected.get(i).go().y);
    
  }
   for (int i = 1;i<scattered.size();i++)
  {
    scattered.get(i).update();
    scattered.get(i).display();
    
  }
  /*for (int i=0; i<300;i++)
  {
    oscs.get(i).go();
  }*/
} 

class osc
{
  PVector origin;
  float len, max_len, dis;
  float velocity, veloc; 
  
  osc(PVector origin_, float vel)
  {
    origin = origin_.get();
    len = 0.0;
    max_len = 300;
    velocity = vel;
    dis = 40;
    veloc =1+ vel/10;
  }
  void go()
  {
    update();
    display(); 
  }
  
  void update()
  {
    len+=velocity;
    origin.y+=veloc;
   if (len>max_len || len<-max_len)
   {
      velocity*=-1;
      if (len>max_len)
      {
        len = max_len-(len-max_len);  
      }
      else
      {
        len = -max_len+(-max_len-len); 
      }
   }
   if(origin.y>300+dis ||origin.y<300-dis)
   {
      veloc*=-1;
      if(origin.y>300+dis)
      {
         origin.y = 300+dis-(origin.y-(300+dis));
      }
      else
      {
        origin.y = 300-dis+((300-dis)-origin.y);
      }
   }
  }
  
  void display()
  {
    stroke((-len+200)/2);
    fill((-len+200)/2);
    //stroke(0);
    //fill(0);
    rect(origin.x, origin.y, 3, len-origin.y+300); 
  }
}

class dial
{
  PVector location;
  float velocity;
  float acceleration;
  float len, max_len;
  float angle;
  dial(float vel, float ang, PVector loc)
   {
    location = loc.get();
    len = 0;
    velocity = vel;
    acceleration = 0;
    angle = ang;
    max_len = 100;
   } 
   
   void update()
  {
    len+=velocity;
   if (len>max_len || len<0)
   {
      velocity*=-1;
      if (len>max_len)
      {
        len = max_len-(len-max_len);  
      }
      else
      {
        len = abs(len); 
      }
   }
  }
  
  PVector go()
  {
    //update();
    //display();
    return new PVector(location.x+ int(cos(angle)*len), location.y +int(sin(angle)*len));
  }
  
  void display()
  {
    stroke(0);
    line(location.x, location.y, location.x+ int(cos(angle)*len), location.y +int(sin(angle)*len));
  }
}
