const fs = require('fs');

const rawHtml = `
<div class="min-h-screen">
  <header>
    <div class="max-w-6xl header-inner">
      <span class="brand">
        <svg viewBox="0 0 240 216" role="img" aria-label="Ribble"><path fill="currentColor" d="M78 26 C118 6 158 16 176 42 C190 34 206 36 212 48 C217 58 210 68 197 71 C224 94 230 126 210 154 C190 182 152 200 116 210 C104 213 99 205 106 196 C124 173 133 158 128 149 C122 138 100 143 80 156 C70 162 63 159 60 150 C56 137 49 130 35 125 C25 122 25 113 35 109 C68 95 94 84 107 76 C114 71 111 67 101 67 C81 68 62 73 47 70 C24 66 16 51 26 36 C36 22 55 24 78 26 Z"/></svg>
        <span>Ribble</span>
      </span>
      <nav class="mainnav">
        <a href="#features">Features</a>
        <button onClick={onStart} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Start reading</button>
      </nav>
    </div>
  </header>

  <main>
    <!-- A. Hero -->
    <section class="hero max-w-6xl px-6">
      <div class="rise-in">
        <h1>Fluency is a side effect of reading well.</h1>
      </div>
      <div class="rise-in" style={{ animationDelay: '120ms' }}>
        <p class="lead">Ribble turns whatever you are already reading into your lesson. Tap any word for meaning and context; it becomes vocabulary you keep, automatically.</p>
      </div>
      <div class="rise-in" style={{ animationDelay: '220ms' }}>
        <form id="start" class="hero-form" onSubmit={(e) => { e.preventDefault(); onStart(); }}>
          <label for="email" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Email address</label>
          <input id="email" type="email" required placeholder="you@example.com" />
          <button type="submit" class="btn-primary">Start reading</button>
        </form>
      </div>
      <div class="rise-in hero-shot" style={{ animationDelay: '340ms' }}>
        <div class="browser-frame lift" style={{ transform: 'rotate(-0.5deg)' }}>
          <div class="titlebar">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            <span class="label">ribble.app — reader</span>
          </div>
          <div class="body">
            <img src="data:image/png;base64,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8sor+/TpI7K0tPSOO+445JBDSN1w3XrrrbNmzUL18MMP/+9//9uvXz+xKjU19corr/z000+dGqqeC3X0AEni1n71V6fudH0ZroRkQ2X+a0Jb9I1TqgB4HqL5cE5o2rX6a11124H60t8K1fK6d1x31N0DbHwBts+2tI8v9eBtt91GmvP222+T58XHx9evX79z587t2rVr3LgxXwZefvnlk046adOmTZMmTZo9e/YPP/xAn9i+fTsl33777R9++AELp2HDhvHxcZ07d27SpAnR6K233spLffbs2TfffHOlSpUoatmy5dVXX0238eCDD86YMQNLK1eurFGjxlFHHYWTpUuXXnLJJUcccQTG4fF42rRpM3v2bL5+fPfdd5R0796dWvXq1fvmm29iY2OjoqLQO+igg77++mvGg2J2z4YMGUL/xHnt2rWnTp3KqC655BIm7bfffstSjB1IxoM3eZ999tmkSZNiY2MBn9+2bdvY2FimYc0fV1f35wHq+uKLL8aMGcN6sX/f2IULF7IGPProo2EwI7r//vsPPvhgaFesWDF16lQ4P/zwwxtvvDF/YQ+HnTh26NCh4cOHM17PPvts2bJl1113HX1HjI9Z8Q082Llz5wce+B8DqVWrVr169QYNGsS0zTvvvPPggw9y9m+B/QO5Y05LSkpKSkq+/PLLN998848//qA2Pz+fb3eU9OnThzI78cQTb7jhBuqPHTsWW6vVqoX8rLPOIgj33nsvaXjNmjXXrl07ZsyYTp06HXTQQbgfNGgQkfrjjz+mPvvssyeddBL1v/3223PPPQfHvvvuy8bYhRdeyN/A/fffz9/fI0eOpLRoX1i1ahUn6/e///0LL7zQq1cvl1/c/Z8//0v22L///W8Y7uK9z+99P+Tggx185J8PPvjgY489dtmyZf45H0Yw/QWz22678Z9wH9hX5mNl/b3oR08B0nQvXbr0nnvuoROD3/LSSy8xyc1L16tXL8/XgB9++GHBggUsXo4++mge2V988QVLl7179y4uLmZvEaT65JNPOnToQAe2atWqa9euS5cu7dixo7jW3XvvPzD99tvvWJ+eeuqpRxxxhD9s9N32/z1w++23M3UWLlyIfP7556fNmMFYxowZ06FDBzx4//vfW7VqZWezZcuWDz74YPny5aNGjbIP2cK+Xb9+/eLFi2F+55139ttvPxJ5hB9+yKExY1568cWXGzRowEq3Tp06xO6dd955/PhJb7751saNGyk5+uij6fH222+/664BBx10EH6jY8KECbfddpvfX92hQwfIqVOnMv0OPPBAfN53330UfPLJJ/k0R82iRYuYF/ztt9/i4uL4Jz3lO0r4dGve/Prrr8+ePZuM+t133z355JNhH3bYYYcccggL1O7du7/66qs42bNnD/6Bzz///PTp00nU6R1jQvT2228/kP/22295S8lY2M891XvvvYfBbtmyhX9GZtXp+n/U/+CDDyZ+9tmn//nPf3gS+P147bXXsAWbNm266qqr6D9l27ZtL7jgAkd/5f+o5b/u+B4rLg3I+9133z3xxBO0qXfv3lQy2P+r1qEw/e1vf6tXr16zZs2ee+459iQ40S233PKZZ54hiWd22rdvz9u1a9euSZMmeN25c2esx6h69erBw0y76qqrvv3223vvvZdx3HjjjQ8++CA2DzvssD333HPo0KEE7u677+bhj6xJkyaPPPJIXl4eq1hY7rnnnr/97W/vvPMOA/H6668PHjwYi19++SV7hU888QRMzJ999tmsNnvssQd7DkceeSSe2223HctfL/Ycbrzxxnr16uFRmzZtbty4cfz48YcffvjAgQNJ1HlbM27cuPPPP5/mQYMGkU4z9Q0YMADnffr02WWXXZ577rnWrVuzm27wM43+i3Hjx+2/f4fD+x+2e1I3UvP4uA1vvfn+nfc/t2r12rL/4m6bM6m+sKioaNKkSccccwy2H3LIIYzvV199RarYqFEjlhSXXnrpnXfe2blzZ7LnnXfe2aFDB1b3M2fOtIfp7bffJgX96aefkAScO3cuj42MGTNG0n58d+rUiXjG0fHHH08xMh/6y1/+QpMNGjQg1b3ssssGDx7M3iXzG8N+7733nnnmmaeccgoVzZs3x17z5s3XrFlDF4488kjk/PnzBw8ezFwA68iRI//2t78R4vPPP5+fF1G/+OKLL774In8S6U5Qffvtt+nQp59+ypN/gZ8Rjz32WO7e8hQ2bNhAW8g4MAnJ0aNHM9Pq0aMHf22sW7cOxwMPPNBrr70YI8QPPvgg8/3JJ5/MB2lY16xZ43K5mANOOukkEun27dsz2kUXXUQgTz/9dDYb5s+fT/B++9vf/vzzz1WrVrVo0QJjRxxR4k/gLbfccueddxL//fbbj72Dfv36jRkz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" alt="Listening room showing a video player beside a timestamped transcript" loading="lazy" /></div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- E. Social proof placeholder -->
    <section class="testimonial-section max-w-6xl px-6">
      <div class="reveal"><h2>From early readers</h2></div>
      <div class="testimonial-grid">
        <div class="reveal">
          <figure class="testimonial-card">
            <blockquote>[TESTIMONIAL PLACEHOLDER — quote from an early reader goes here.]</blockquote>
            <figcaption>[NAME PLACEHOLDER] · [ROLE PLACEHOLDER]</figcaption>
          </figure>
        </div>
        <div class="reveal" style={{ transitionDelay: '100ms' }}>
          <figure class="testimonial-card">
            <blockquote>[TESTIMONIAL PLACEHOLDER — quote from an early reader goes here.]</blockquote>
            <figcaption>[NAME PLACEHOLDER] · [ROLE PLACEHOLDER]</figcaption>
          </figure>
        </div>
        <div class="reveal" style={{ transitionDelay: '200ms' }}>
          <figure class="testimonial-card">
            <blockquote>[TESTIMONIAL PLACEHOLDER — quote from an early reader goes here.]</blockquote>
            <figcaption>[NAME PLACEHOLDER] · [ROLE PLACEHOLDER]</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- F. Final CTA -->
    <section class="final-cta">
      <div class="max-w-3xl px-6 inner">
        <div class="reveal">
          <h2>Read the thing you wanted to read. Keep every word.</h2>
          <div class="cta-wrap">
            <button onClick={onStart} class="btn-primary">Start reading</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="max-w-6xl footer-inner">
      <span class="footer-brand">
        <svg viewBox="0 0 240 216" role="img" aria-label="Ribble"><path fill="currentColor" d="M78 26 C118 6 158 16 176 42 C190 34 206 36 212 48 C217 58 210 68 197 71 C224 94 230 126 210 154 C190 182 152 200 116 210 C104 213 99 205 106 196 C124 173 133 158 128 149 C122 138 100 143 80 156 C70 162 63 159 60 150 C56 137 49 130 35 125 C25 122 25 113 35 109 C68 95 94 84 107 76 C114 71 111 67 101 67 C81 68 62 73 47 70 C24 66 16 51 26 36 C36 22 55 24 78 26 Z"/></svg>
        <span>Ribble</span>
      </span>
      <nav class="footer-nav">
        <a href="#start">Product</a>
        <a href="#start">Privacy</a>
        <a href="#start">Contact</a>
      </nav>
      <p class="footer-copy" id="copyright">© 2026 Ribble</p>
    </div>
  </footer>
</div>
`;

// regex to change class= to className= and for= to htmlFor=
const converted = rawHtml.replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=');
fs.writeFileSync('src/components/LandingView.html.tsx', converted);
