PRAIRIE BLASTER — reemplazo de assets
======================================

El juego funciona ahora mismo con formas genéricas dibujadas por código
(círculos, triángulos, rectángulos de colores). Podés reemplazarlas por
gráficos reales sin tocar el código: solo agregá archivos PNG en esta
carpeta (juego/assets/img/) con EXACTAMENTE estos nombres. El juego los
detecta solo al cargar la página; si un archivo no existe, sigue usando
la forma genérica de respaldo para ese elemento.

Archivos que reconoce el juego:

  player.png           - el personaje jugable (recomendado: mirando a la derecha,
                          cuadrado, fondo transparente, ~64x64px)
  enemy_grunt.png       - enemigo básico (morado por defecto), ~64x64px
  enemy_runner.png      - enemigo rápido (naranja por defecto), ~64x64px
  enemy_shooter.png     - enemigo que dispara a distancia (verde por defecto), ~64x64px
  boss.png              - jefe (rojo por defecto), ~128x128px
  bullet_player.png     - disparo del jugador, ~24x24px
  bullet_enemy.png      - disparo enemigo, ~24x24px
  pickup_heart.png      - power-up de vida, ~32x32px
  pickup_spread.png     - power-up de disparo triple, ~32x32px
  obstacle.png          - bloques/obstáculos del escenario (se estiran al
                          tamaño de cada bloque, no hace falta que sea cuadrado)
  ground_tile.png       - textura de piso, se repite en mosaico de 60x60px

Recomendaciones:
- Usá PNG con fondo transparente.
- El jugador y los enemigos se dibujan centrados y rotados según corresponda,
  así que conviene que el sprite "mire" hacia la derecha (0°) por defecto.
- No hace falta reemplazar todos los archivos: podés ir agregando de a uno
  y el resto seguirá usando las formas genéricas hasta que los sumes.
