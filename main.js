import { CARD, CHOICE, CHOICE_LIKE, CHOICE_NOPE, DECISION_THRESHOLD, GO_LEFT, GO_RIGHT, RESET } from './constant.js'
import { $, $$ } from './libs/dom.js'

let isAnimating = false
let pullDeltaX = 0 // distancia que la card se está arrastrando

function startDrag (event) {
  // si ya se esta animando una card, no hacer nada
  if (isAnimating) return
  // recuperar el primer elemento
  const actualCard = event.target.closest(CARD)
  if (!actualCard) return
  // obtener la posición inicial del mouse
  const startX = event.pageX ?? event.touches[0].pageX
  // escuchar el movimiento del mouse
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  // escuchar el movimiento del touch
  document.addEventListener('touchmove', onMove, { passive: true })
  document.addEventListener('touchend', onEnd, { passive: true })

  function onMove (event) {
    // obtener la posición actual del mouse
    const currentX = event.pageX ?? event.touches[0].pageX
    // calcular la distancia que se ha movido el mouse
    pullDeltaX = currentX - startX
    // si no hay una distancia, no hacer nada
    if (pullDeltaX === 0) return
    // indicar que se esta animando la card
    isAnimating = true
    // calcular el ángulo de rotación
    const deg = pullDeltaX / 14
    // mover la card
    actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`
    actualCard.style.cursor = 'grabbing'
    // cambiar la opacidad del texto
    const opacity = Math.abs(pullDeltaX) / 100
    // determinar si el usuario esta arrastrando la card hacia la derecha o izquierda
    const isRight = pullDeltaX > 0
    // obtener el elemento que se moverá
    const element = $(isRight ? `${CHOICE_LIKE}` : `${CHOICE_NOPE}`, actualCard)
    // cambiar la opacidad del texto
    element.style.opacity = opacity
  }
  
  function onEnd () {
    // eliminar los eventos de mouse
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    // eliminar los eventos de touch
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
    // saber si el usuario tomo una decisión
    const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD
    // si el usuario tomo una decisión, animar la card    
    if (decisionMade) {
      const goRight = pullDeltaX >= 0
      // agregar la clase de animación
      actualCard.classList.add(goRight ? GO_RIGHT : GO_LEFT)
      // esperar a que termine la animación
      actualCard.addEventListener('transitionend', () => {
        actualCard.remove()
      }, { once: true })
    } else {
      // si no se tomo una decisión, regresar la card a su posición original
      actualCard.classList.add(RESET)
      actualCard.classList.remove(GO_RIGHT, GO_LEFT)
      // regresar la opacidad del texto a su valor original
      $$(CHOICE, actualCard).forEach(choice => choice.style.opacity = 0)
    }
    // resetear la distancia que se ha movido el mouse
    actualCard.addEventListener('transitionend', () => {
      actualCard.removeAttribute('style')
      actualCard.classList.remove(RESET)
      pullDeltaX = 0
      isAnimating = false
    }, { once: true })
  }
}

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })