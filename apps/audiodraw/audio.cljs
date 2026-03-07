(ns draw-music.core
  (:require
    [sablono.core :as sab :include-macros true]
    [cljs.reader :as rdr]))

(enable-console-print!)

(def bottom-line 350)
(def line-scale 0.2)
(def canvas-height 400)
(def canvas-width 800)

(def canvas-vars {:envelope {:color "#000000"}
                  :freqbytime {:color "#FF0000"}})

;; define your app data so that it doesn't get over-written on reload
(defonce app-state (atom {:canvas nil
                          :offsets nil
                          :line-type "Volume"
                          :scale 160}))

(defonce canvas-state (atom {:touch-started false
                             :type :envelope
                             :envelope [{:x 1000 :y 1000}]
                             :freqbytime [{:x 1000 :y 1000}]}))

(defn clear-canvas [{[ctx w h] :canvas}]
  (.clearRect ctx 0 0 w h))

(defn draw-scale-line [x h ctx]
  (.beginPath ctx)
  (set! ctx.lineWidth "2")
  (set! ctx.strokeStyle "#000000")
  (.moveTo ctx x 0)
  (.lineTo ctx x h)
  (.stroke ctx))

(defn draw-scale-lines [{scale :scale [ctx w h] :canvas}]
  (doseq [x (range scale w scale)]
    (draw-scale-line x h ctx)))

(defn draw-horizontal-line [{[ctx w h] :canvas [offLeft offTop] :offsets}]
  (.beginPath ctx)
  (set! ctx.lineWidget "2")
  (set! ctx.strokeStyle "#000000")
  (.moveTo ctx 0 (- bottom-line offTop))
  (.lineTo ctx w (- bottom-line offTop))
  (.stroke ctx))

(defn draw-line [{x1 :x y1 :y} x2 y2 {[ctx] :canvas [offLeft offTop] :offsets} color]
  (.beginPath ctx)
  (set! ctx.lineWidth "3")
  (set! ctx.strokeStyle color)
  (.moveTo ctx (- x1 offLeft) (- y1 offTop))
  (.lineTo ctx (- x2 offLeft) (- y2 offTop))
  (.stroke ctx))

(defn draw-single-type [app-data data color]
  (doseq [p (range 1 (count data))]
    (let [p1 (data (- p 1))
          {x2 :x y2 :y} (data p)]
      (draw-line p1 x2 y2 app-data color))))

(defn draw-lines [app-data {env :envelope freq :freqbytime}]
  (draw-single-type app-data env (:color (:envelope canvas-vars)))
  (draw-single-type app-data freq (:color (:freqbytime canvas-vars))))

(defn redraw-canvas [app-data canvas-data]
  (clear-canvas app-data)
  (draw-scale-lines app-data)
  (draw-horizontal-line app-data)
  (draw-lines app-data canvas-data))

(defn update-points [points oscale nscale]
  (let [[zero _] (:offsets @app-state)
        scale (/ nscale oscale)]
    (vec (for [p points]
           {:x (+ zero (* scale (- (:x p) zero))) :y (:y p)}))))

(defn update-scale [e]
  (let [inp (.getElementById js/document "scale")
        scale (- 400 (rdr/read-string inp.value))
        env (:envelope @canvas-state)
        freq (:freqbytime @canvas-state)]
    (swap! canvas-state assoc
           :envelope (update-points env (:scale @app-state) scale)
           :freqbytime (update-points freq (:scale @app-state) scale))
    (swap! app-state assoc :scale scale)))

(defn place-line [x oy]
  (let [t (:type @canvas-state)
        c (:color (t canvas-vars))]
    (if (and (:touch-started @canvas-state) (> x (:x (peek (t @canvas-state)))))
      (let [y (if (< oy bottom-line) oy bottom-line)]
        (draw-line (peek (t @canvas-state)) x y @app-state c)
        (swap! canvas-state assoc
               t (conj (t @canvas-state) {:x x :y y}))))))

(defn update-offsets []
  (let [can (.getElementById js/document "wave-canvas")
        p (.getElementById js/document "app")
        b (.getElementById js/document "board")]
    (swap! app-state assoc
           :offsets [(+ (. p -offsetLeft) (. b -offsetLeft)) (+ (. p -offsetTop) (. b -offsetTop))])))

(defn mouse-down [e]
  (let [t (:type @canvas-state)
        oenv (t @canvas-state)
        lx (:x (peek oenv))
        env (if (< e.pageX lx) [{:x e.pageX :y e.pageY}] oenv)]
    (swap! canvas-state assoc
           :touch-started true
           t env))
  (update-offsets)
  (redraw-canvas @app-state @canvas-state))

(defn handle-end []
  (swap! canvas-state assoc :touch-started false))

(defn handle-move [e]
  (.preventDefault e)
  (update-offsets)
  (let [touches (. e -changedTouches)
        touch (.item touches 0)]
    (if-not (:touch-started @canvas-state)
      (mouse-down touch))
    (place-line touch.pageX touch.pageY)))

(defn envelope-amplitude [y]
  (if (> y bottom-line)
    0
    (- 1 (/ y bottom-line))))

(defn frequency-amplitude [y]
  (if (> y bottom-line)
    400
    (+ 400 (* 50 (- 1 (/ y bottom-line))))))

(defn play []
  (let [env (:envelope @canvas-state)
        freq (:freqbytime @canvas-state)
        dur (* (/ (- (:x (peek env)) (:x (first env))) (:scale @app-state)) line-scale)
        arr (for [e env] (int-array [(:x e) (envelope-amplitude (:y e))]))
        fre (for [f freq] (int-array [(:x f) (frequency-amplitude (:y f))]))]
    (if (or (< (count env) 2) (< (count freq) 2))
      (js/alert "Use Toggle Line to add another line!")
    (js/playNote dur (int-array fre) (int-array arr)))))

(defn update-line-title []
  (let [t (if (= (:type @canvas-state) :envelope) "Volume" "Frequency")]
    (swap! app-state assoc :line-type t)))

(defn toggle-line []
  (let [t (if (= (:type @canvas-state) :envelope) :freqbytime :envelope)]
    (do
      (swap! canvas-state assoc :type t)
      (update-line-title))))

(defn main-template [data]
  (sab/html [:div {:id "app-panel"}
             [:div.board {:id "board"}
              [:canvas {:id "wave-canvas"
                        :onMouseDown mouse-down
                        :onMouseMove (fn [e] (place-line e.pageX e.pageY))
                        :onTouchMove handle-move
                        :onMouseUp handle-end
                        :onMouseOut handle-end
                        :onTouchOut handle-end
                        :onTouchEnd handle-end
                        :width canvas-width
                        :height canvas-height}]]
             [:div.btns
              [:a.btn {:onClick play} "Play Note"]
              [:a.btn {:onClick toggle-line} "Toggle Line"]
             ]
             [:input.text {:type "range" :id "scale" :min "0" :max "370" :on-change update-scale}]
             ; [:p.scale (str (* 1000 line-scale) "ms/division")]
             [:p.text "Currently drawing: " (:line-type @data)]
             ]))
            

(defn render! []
  (.render js/React
           (main-template app-state)
           (.getElementById js/document "app"))
  (if (:canvas @app-state)
    (redraw-canvas @app-state @canvas-state)))

(add-watch app-state :on-change (fn [_ _ _ _] (render!)))

(.initializeTouchEvents js/React true)
(render!)

(let [can (.getElementById js/document "wave-canvas")
      ctx (.getContext can "2d")
      p (.getElementById js/document "app")
      b (.getElementById js/document "board")]
  (swap! app-state assoc
         :canvas [ctx (. can -width) (. can -height)]
         :offsets [(+ (. p -offsetLeft) (. b -offsetLeft)) (+ (. p -offsetTop) (. b -offsetTop))]))

(defn on-js-reload []
  )
