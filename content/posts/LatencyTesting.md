Title: Keyboard Latency Testing
Date: 2024-03-27 00:00
Tags: qmk, keyboard
Keywords: qmk, keyboard, home-row, typing
Authors: Caleb
Summary: Lightweight keyboard re-mapper latency testing


I recently wanted to experiment with [home-row mods](https://precondition.github.io/home-row-mods). I have a QMK enabled keyboard, but I want my mods to be portable for when I'm travelling and don't have my external keyboard. There are several remapping tools that can implement home-row mods on linux, notably [KMonad], [Kanata], and [keyd]. While these tools have different feature sets and goals, they all overlap in meeting my needs. The deciding factor for me is latency, I want the tool that imparts smallest additional latency to my typing [: See [Dan Luu's][danluu] writings about latency]. To compare latency between the different tools, I wrote a small python script; which is the subject of this post.

*Note about latency testing: robust end-to-end latency testing is done  using a circuit that triggers a key-press and a light sensor to catch actual rendering[: See a cool setup by [Tristan Hume][thume]]. This is a great way to determine actual latency. But for my use, I only care about relative latency (which tool introduces the most latency), so a lightweight method will be suitable.*

I would like to directly measure the latency (delay) introduced by the remapping tool from the point it receives my keypress, to the time the application receives the keypress — but I don't know how to do that. What I can do is prompt myself to press a key, and measure how long it takes from the start of the prompt, to when my script receives the keypress. The measured latency includes roughly 3 components.

1. System/OS latency. This is from my keyboard, the OS, my terminal, etc.
2. My reaction time. [Wikipedia][distribution] says the fastest human reaction times are somewhere between 100ms and 200ms.
3. Latency introduced by the remapping tool.

While none of these components will be consistent across every keypress, we can assume they all have a consistent distribution [: The [distribution of human reaction times][distribution] seems to be consistent at least]. Since all the delay distributions are consistent, I can directly compare the mean reaction delay using each tool to determine the relative latencies. The differences in mean reaction time will be the differences in latency of each remapping tool. 

<details>
	<summary>
		Boring Math
	</summary>

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mstyle displaystyle="true" scriptlevel="0">
    <mrow data-mjx-texclass="ORD">
      <mtable rowspacing=".5em" columnspacing="1em" displaystyle="true">
        <mtr>
          <mtd>
            <mtable columnalign="left left" columnspacing="1em" rowspacing="4pt">
              <mtr>
                <mtd>
                  <msub>
                    <mi>l</mi>
                    <mi>s</mi>
                  </msub>
                  <mo>=</mo>
                  <mtext>System/OS latency</mtext>
                </mtd>
              </mtr>
              <mtr>
                <mtd>
                  <msub>
                    <mi>l</mi>
                    <mi>h</mi>
                  </msub>
                  <mo>=</mo>
                  <mtext>Human reaction time</mtext>
                </mtd>
              </mtr>
              <mtr>
                <mtd>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>a</mi>
                  </msubsup>
                  <mo>=</mo>
                  <mtext>Latency from remapping tool A</mtext>
                </mtd>
              </mtr>
              <mtr>
                <mtd>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>b</mi>
                  </msubsup>
                  <mo>=</mo>
                  <mtext>Latency from remapping tool B</mtext>
                </mtd>
              </mtr>
              <mtr>
                <mtd>
                  <msub>
                    <mi>m</mi>
                    <mi>t</mi>
                  </msub>
                  <mo>=</mo>
                  <mtext>Mean Latency from&#xA0;</mtext>
                  <mi>n</mi>
                  <mtext>&#xA0;trials</mtext>
                </mtd>
              </mtr>
              <mtr>
                <mtd>
                  <msub>
                    <mi>m</mi>
                    <mi>t</mi>
                  </msub>
                  <mo>=</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>s</mi>
                  </msub>
                  <mo>+</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>h</mi>
                  </msub>
                  <mo>+</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>t</mi>
                  </msub>
                </mtd>
              </mtr>
            </mtable>
          </mtd>
        </mtr>
      </mtable>
    </mrow>
  </mstyle>
</math>
<br>
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mstyle displaystyle="true" scriptlevel="0">
    <mrow data-mjx-texclass="ORD">
      <mtable rowspacing=".5em" columnspacing="1em" displaystyle="true">
        <mtr>
          <mtd>
            <mtable displaystyle="true" columnalign="right left" columnspacing="0em" rowspacing="3pt">
              <mtr>
                <mtd>
                  <mtext>Latency Difference</mtext>
                </mtd>
                <mtd>
                  <mi></mi>
                  <mo>=</mo>
                  <msubsup>
                    <mi>m</mi>
                    <mi>t</mi>
                    <mi>a</mi>
                  </msubsup>
                  <mo>&#x2212;</mo>
                  <msubsup>
                    <mi>m</mi>
                    <mi>t</mi>
                    <mi>b</mi>
                  </msubsup>
                </mtd>
              </mtr>
              <mtr>
                <mtd></mtd>
                <mtd>
                  <mi></mi>
                  <mo>=</mo>
                  <mo stretchy="false">(</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>s</mi>
                  </msub>
                  <mo>+</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>h</mi>
                  </msub>
                  <mo>+</mo>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>a</mi>
                  </msubsup>
                  <mo stretchy="false">)</mo>
                  <mo>&#x2212;</mo>
                  <mo stretchy="false">(</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>s</mi>
                  </msub>
                  <mo>+</mo>
                  <msub>
                    <mi>l</mi>
                    <mi>h</mi>
                  </msub>
                  <mo>+</mo>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>b</mi>
                  </msubsup>
                  <mo stretchy="false">)</mo>
                </mtd>
              </mtr>
              <mtr>
                <mtd></mtd>
                <mtd>
                  <mi></mi>
                  <mo>=</mo>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>a</mi>
                  </msubsup>
                  <mo>&#x2212;</mo>
                  <msubsup>
                    <mi>l</mi>
                    <mi>t</mi>
                    <mi>b</mi>
                  </msubsup>
                </mtd>
              </mtr>
            </mtable>
          </mtd>
        </mtr>
      </mtable>
    </mrow>
  </mstyle>
</math>
</details>

![image demonstrating the distribution of human response times](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Reaction_time_density_plot.svg/2880px-Reaction_time_density_plot.svg.png)
<p><center>Distribution of Human Reaction times. Source:<a href="https://commons.wikimedia.org/wiki/File:Reaction_time_density_plot.svg">Emily Willoughby</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>, via Wikimedia Commons</center></p>

To measure reaction time, I set up a basic python script that prompts me to press a key [: If you just want to play around with reactions times, checkout [Human Benchmark][humanbenchmark]]. The trick is that the prompt comes after a random delay, which prevents me from accidentally finding a rhythm and reflexively pressing early.

This is done with the following python code

```python
time.sleep(random.random() * 1.5 + 1) # 1s - 2.5s delay
start = time.perf_counter()
os.system('read -n 1 -s -r -p "Press any key"')
print(time.perf_counter() - start)
```

The reaction time from each key press is measured, and then reduced into mean, and median. I would also like to calculate mode, but I didn't feel I was working with enough samples to calculate it accurately [: This is probably an indication that I don't have enough samples to draw *any* meaningful conclusion, but `¯\_(ツ)_/¯`]. I can then compare these statistics between keyd, kanata, and the baseline of nothing.

While gathering data I did occasionally twitch and get a sub 100ms reaction time, or lose focus and get a 1s reaction time. Outliers were removed with the following code:

```python
# These boundaries were chosen based on my own reaction times
# They might need tuning on other systems 
delays = [d for d in delays if d > 0.1 and d < 0.4]
```

For the tests I measured the latencies of pressing my home-row mod key (`f`) on my base system, keyd, and kanata. I did an additional test with kanata using a different key (`j`). Each metric was calculated based on 50 keypresses done 10 at a time — I should do more, but it's boring.

|            | Mean (s) | Median (s) |
| ---------- | -------- | ---------- |
| Base (f)   |  0.2772  |   0.2732   |
| keyd (f)   |  0.3112  |   0.3099   |
| Kanata (f) |  0.3216  |   0.3174   |
| Kanata (j)* |  0.2628  |   0.2602   |

*\*Note: The `j` Kanata test was done the next day after a good sleep. A quick retest of the Base shows a mean of 0.2537s. I didn't want to go through all 50 again, so the discrepancy stands.*

While this isn't the most statistically sound test, the results definitely show that adding home-row mods can add latency. While it seems clear that keyd and kanata are adding a delay; the keypress isn't triggered until the key-up event (vs. key-down in the base) for the home-row mod remapping. This means that there is an additional component to the delay (how low it takes me to lift my finger back up after pressing). The `j` test shows that the tools are not adding meaningful latencies to other characters, which suggest that much of the latency difference is the time it takes me to lift my finger off the key. Based on my testing, there does still seem to be a small difference in the keyd and Kanata latencies. Speed is [a core goal][keyd speed] of keyd, so I'm not surprised that it performs well here.

At the beginning of this post I said that I would choose a remapping tool based on latencies alone, but I ended up just using kanata. At the time I was setting up my system, keyd didn't quite support my desired configuration, but it does now. I've stayed with Kanata because I like the direction of the project and how responsive [jtroo] is to new ideas. That said, I admire the design of keyd and it's minimalism, this testing shows that it's worth checking out again.

Please let me know if you find this technique helpful, or if you have any additions to improve it!

<br>

<details>
	<summary>
		Full Code Listing
	</summary>

The up-to-date code, as well as the raw data from my testing can be found <a href="https://github.com/CalebJohn/latency_testing">on github</a>. 

```python
import time
import random
import os
import json

"""
This script measures the latency of the keyboard input by prompting the user for a 
keypress at a random interval between 1 and 3 seconds. The latency is measured as the
time between the prompt and the keypress. The script repeats this process 11 times and
prints the mean, median, max, and min latency.

This is not sufficient for measuring absolute latency. But is useful for comparing
relative latency between different systems (QMK configurations in my case).

"""

delays = []
try:
	for i in range(50):
		time.sleep(random.random() * 1.5 + 1)
		start = time.perf_counter()
		os.system('read -n 1 -s -r -p "Press any key "')
		delay = time.perf_counter() - start
		print(delay)
		delays.append(delay)

		if (i+1) % 10 == 0:
			os.system('read -n 1 -s -r -p "Take a quick break, press a key when you\'re ready to continue "')
			print()

except KeyboardInterrupt:
	pass

delays = [d for d in delays if d > 0.1 and d < 0.4]

mean = sum(delays) / len(delays)
bucketed = [round(d, 2) for d in delays]
# This is the formula for variance of sample, rather than
# variance of a population
variance = sum([(x - mean) ** 2 for x in delays]) / (len(delays) - 1)
print("\nmean:     ", mean)
print("median:   ", sorted(delays)[len(delays) // 2])
print("mode:     ", max(set(bucketed), key=bucketed.count))
print("std. dev.:", variance ** 0.5)
print("max:      ", max(delays))
print("min:      ", min(delays))
```
</details>

[thume]: https://thume.ca/2020/05/20/making-a-latency-tester/
[danluu]: https://danluu.com/keyboard-latency/
[distribution]: https://en.wikipedia.org/wiki/Mental_chronometry#Distribution_of_response_times
[jtroo]: https://github.com/jtroo
[Kanata]: https://github.com/jtroo/kanata
[keyd]: https://github.com/rvaiya/keyd
[keyd speed]: https://github.com/rvaiya/keyd?tab=readme-ov-file#goals
[KMonad]: https://github.com/kmonad/kmonad
[on github]: https://github.com/CalebJohn/
[humanbenchmark]: https://humanbenchmark.com/tests/reactiontime
