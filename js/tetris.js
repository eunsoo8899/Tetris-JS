import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector(".playground > ul")
const gameText = document.querySelector(".game-text")
const scoreDisplay = document.querySelector(".score")
const restartButton = document.querySelector(".game-text > button")
// setting
const GAME_ROWS = 20
const GAME_CORS = 10

// variables
let score = 0
let duration = 500
let downInterval
let tempMovingItem



const movingItem = {
  type: "",
  direction: 0,
  //* + left, top 을 이용해서 시작 위치를 조정
  //* 화살표를 누르면 top, left를 1씩 증가 시켜서 블록을 이동 시킨다
  top: 0,
  left: 0
}

init()

// functions
function init () {
  //* tempMovingItem = movingItem <- 이렇게 하면 
  //* movingItem 값이 변경되기 때문에 ... 스프레드 사용
  //* movingItem 안에 값만 가져와서 넣는 것
  tempMovingItem = {...movingItem}
  // console.log(tempMovingItem)
  for(let i = 0; i < GAME_ROWS; i++) {
    // console.log(i)
    prependNewLine()
  }

  generateNewBlcok()
}
function prependNewLine () {
  const li = document.createElement("li")
  const ul = document.createElement("ul")  
  for (let j = 0; j < GAME_CORS; j++) {
    const matrix = document.createElement("li")
    ul.prepend(matrix)
  }
  li.prepend(ul)
  playground.prepend(li)
}
//* block을 그리는 function
function renderBlocks (moveType = "") {
  //* 구조분해 할당 (distructuring)
  const{ type, direction, top, left} = tempMovingItem

  //* 이동하게 되면 이동 전 class를 지우고 이동 후 
  //* 아래쪽 target.classList.add(type, "moving")에서 다시 class를 입힌다.
  const movingBlocks = document.querySelectorAll(".moving")
  movingBlocks.forEach(moving => {
    // console.log(moving)
    moving.classList.remove(type, "moving")
  })

  //* type => tree, direction => 좌표
  //* forEach 반복문을 돌면서 좌표를 확인
  BLOCKS[type][direction].some(block => {
    //* + left, top 을 이용해서 시작 위치를 조정
    const x = block[0] + left
    const y = block[1] + top
    //* chiledNodes 확인
    // console.log({ playground })
    
    //* 좌,우,아래 칸을 벗어나게 되는 경우는 이동 하지 않게
    //* 삼항 연산자를 이용, 세로 확인
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null
    
    //* 가로 확인
    const isAvailable = checkEmpty(target)
    if (isAvailable) {
      //* target.classList.add(type) 블록 이동 잔상 제거 이전코드
      //* 추가로 moving class를 넣어 준다
      target.classList.add(type, "moving")
    } else {
      tempMovingItem = { ...movingItem }
      //* 게임오버
      if(moveType === 'retry') {
        clearInterval(downInterval)
        showGameoverText()
      }
      //* 이벤트가 전부 실행되고 다시 render되도록 setTimeout을 넣어준다
      setTimeout(() => {
        renderBlocks('retry')

        //* 블록이 바닥에 도착하면 넘치지 않고 고정 되도록
        if(moveType === "top") {
          seizeBlock()
        }
      }, 0);
      //* 빈 값이 있게 되면 return true 를 실행 함으로 써 불필요한 동작을 줄임
      //* forEach는 중단이 불가능 하기 때문에 
      //* BLOCKS[type][direction].forEach에서 some 으로 변경해준다
      return true
    }
  })

  //* 이벤트를 한바퀴 다 돌고 나서 정상적이면 mocingItem의 값을 바꿔 준다
  movingItem.left = left
  movingItem.top = top
  movingItem.direction = direction
}
function seizeBlock () {
  const movingBlocks = document.querySelectorAll(".moving")
  movingBlocks.forEach(moving => {
    //* 기존의 moving class를 지워서 더 이상 움직이지 못하게
    moving.classList.remove("moving")
    //* seized class를 추가
    moving.classList.add("seized")
  })
  checkMatch()
}
function checkMatch () {
  //* childNodes를 불러오고 forEach를 돌려서 각각의 node를 확인
  const childNodes = playground.childNodes
  childNodes.forEach(child => {
    let matched = true

    //* 가로로 1줄의 li를 다시한번 forEach
    child.children[0].childNodes.forEach(li => {
      //* seized가 아닌게 1개라도 있으면
      if(!li.classList.contains("seized")){
        matched = false
      }
    })
    if(matched) {
      //* matched일때 child <= 1줄 을 지우고
      //* 새롭게 비어있는 1줄을 불러옴
      child.remove()
      prependNewLine()
      //* matched일때 score 1점씩 추가
      score++
      scoreDisplay.innerText = score
    }
  })
  generateNewBlcok()
}
function generateNewBlcok() {  

//*  자동으로  내려오는 interval 설정
clearInterval(downInterval)
downInterval = setInterval(() => {
  moveBlock('top', 1)
}, duration)

  const blockArray = Object.entries(BLOCKS)
  const randomIndex = Math.floor(Math.random() * blockArray.length)
  // * blockArray[randomIndex][0] 이걸로 블록 이름을 불러온다
  // console.log(blockArray[randomIndex][0])
  
  movingItem.type = blockArray[randomIndex][0]
  movingItem.top = 0
  movingItem.left = 3
  movingItem.direction = 0
  tempMovingItem = { ...movingItem }
  renderBlocks()
}
function changeDirection () {
  //* 이렇게 해도 되는데 코드가 지저분 하니 삼항연산자 사용
  // tempMovingItem.direction += 1
  // if (tempMovingItem.direction === 4) {
  //   tempMovingItem.direction = 0
  // }
  const direction = tempMovingItem.direction
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1
  renderBlocks()
}
function checkEmpty(target) {
  //* 여백체크 + seized 체크[classList.contains]
  if(!target || target.classList.contains("seized")) {
    return false
  }
  return true
}
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount
  renderBlocks(moveType)
}
function dropBlock () {
  clearInterval(downInterval)
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  },10)
}
function showGameoverText() {
  gameText.style.display = 'flex'
}

// event handling
document.addEventListener("keydown", e => {
  // console로 keycode 확인
  // console.log(e)
  switch(e.keyCode) {
    //* 39, 37 좌우 이동 40 아래로 이동  
    case 39:
      moveBlock("left", 1)
      break
    case 37:
      moveBlock("left", -1)
      break
    case 40:
      moveBlock("top", 1)
      break
    
    //* direction을 변하게 해서 모양을 바꿈
    case 38:
      changeDirection()
      break

    case 32:
      dropBlock()

    default:
      break
    
  }
})

//* restart 버튼 
restartButton.addEventListener("click", ()=>{
  playground.innerHTML = "";
  gameText.style.display = "none"
  init()
})