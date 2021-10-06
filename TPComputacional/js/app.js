"use strict";
const fileInput = document.querySelector('#input_file');
const imgInput = document.querySelector('#img_input');
const canvas =  document.querySelector('#canvas');
const context = canvas.getContext('2d');
const selectList = document.querySelector('#filter__list');
let pixelColors = [];
let pixelsCopy = [];

let R;
let G;
let B;

let canvasWidth;
let canvasHeight;
let typeOfFilter = null;


function getCanvasDimensions(){
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

function getListValue(e){
    typeOfFilter = e.target.value.trim();
    if (typeOfFilter === null || typeOfFilter === "")
        return;
    loadPicture();
}
function colourToNumber(r, g, b) {
    return (r << 16) + (g << 8) + (b);
}

function NumberToRGB(number){
    const r = (number & 0xff0000) >> 16;
    const g = (number & 0x00ff00) >> 8;
    const b = (number & 0x0000ff);
    R = r;
    G = g;
    B = b;
}


function loadPicture(){
    const img = new Image();
    img.src = imgInput.src;
    getCanvasDimensions();
    img.width = canvasWidth;
    img.height = canvasHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    img.onload = function(){
        context.drawImage(img,0,0,canvas.width,canvas.height);
        Filter();
        canvas.classList.add('animation');
        setTimeout(() => {
            canvas.classList.remove('animation');
        },500);
    }
}
function getImgData(){
    return context.getImageData(0,0,canvas.width,canvas.height);
}
function Filter(){
    pixelColors = []
    pixelsCopy = []
    const imageData = getImgData();
    const pixels = imageData.data;
    const numberPixels = imageData.width * imageData.height;
    let width = imageData.width;
    let height = imageData.height;
    
    let cont = 0;
    for(let i =0; i<height;++i){
        let tmpArr = [];
        for(let j=0;j<width;++j){
            const r = pixels[cont*4];
            const g = pixels[cont*4+1];
            const b = pixels[cont*4+2];
            let aux = [r,g,b];
            tmpArr.push(aux);
            ++cont;
        }
        pixelColors.push(tmpArr);
        pixelsCopy.push(tmpArr);
    }
    switch(typeOfFilter){
        case "Average Filter":
            applyMask(averageFilterIn(width,height,0),averageFilterIn(width,height,1),averageFilterIn(width,height,2));
            break;
        case "Median Filter":
            applyMask(medianFilterIn(width,height,0),medianFilterIn(width,height,1),medianFilterIn(width,height,2));
            break;
        case "Laplacian Filter":
            applyMask(laplacianFilterIn(width,height,0),laplacianFilterIn(width,height,1),laplacianFilterIn(width,height,2));
            break;
    }
    let arr = MatrixToArray(pixelsCopy);
    for(let k =0; k<numberPixels;++k){
        pixels[k*4] = arr[k][0];
        pixels[k*4+1] = arr[k][1];
        pixels[k*4+2] = arr[k][2];
    }
    context.putImageData(imageData,0,0);
}

function isNegative(arr){
    for(let i=0;i<arr.length;++i){
        for(let j=0;j<arr[0].length;++j){
            if(arr[i][j]<0)
                return true;
        }
    }
    return false;
}

function Transform(arr,m,b){
    let newArr = [];
    for(let i=0;i<arr.length;++i){
        let row = [];
        for(let j=0;j<arr[0].length;++j){
            const value = (m*arr[i][j])+b;
            row.push(value);
        }
        newArr.push(row);
    }
    return newArr;
}

function medianFilterIn(width,height,pos){
    let arr = [];
    for(let i = 0; i < height; ++i){
        let row = [];
        for(let j = 0; j < width; ++j){
            let tmp = [];
            if(i-1>=0){
                tmp.push(pixelColors[i-1][j][pos]);
            }
            if(i+1<height){
                tmp.push(pixelColors[i+1][j][pos]);
            }
            if(j-1>=0){
                tmp.push(pixelColors[i][j-1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j-1][pos]);
                }
                if(i+1<height){
                   tmp.push(pixelColors[i+1][j-1][pos]);
                }
            }
            if(j+1<width){
                tmp.push(pixelColors[i][j+1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j+1][pos]);
                }
                if(i+1<height){
                    tmp.push(pixelColors[i+1][j+1][pos]);
                }
            }
            tmp.sort(function(a,b){
                if (a > b) {
                    return 1;
                  }
                  if (a < b) {
                    return -1;
                  }
                  return 0;
            });
            const medium = tmp[Math.round(tmp.length/2)];
            row.push(medium);
        }
        arr.push(row);
    }
    return arr;
}
function MatrixToArray(arr){
    let tmp = [];
    for(let i=0;i<arr.length;++i){
        for(let j=0;j<arr[0].length;++j)
            tmp.push(arr[i][j]);
    }
    return tmp;
}
function minumun(arr){
    let mini = arr[0][0];
    for(let i=0;i<arr.length;++i){
        for(let j=0;j<arr[0].length;++j){
            if(mini > arr[i][j]){
                mini = arr[i][j];
            }
        }
    }
    return mini;
}
function maximum(arr){
    let maxi = arr[0][0];
    for(let i=0;i<arr.length;++i){
        for(let j=0;j<arr[0].length;++j){
            if(maxi < arr[i][j]){
                maxi = arr[i][j];
            }
        }
    }
    return maxi;
}
function laplacianFilterIn(width,height,pos){
    let arr = [];
    for(let i = 0; i < height; ++i){
        let row = [];
        for(let j = 0; j < width; ++j){
            let tmp = [];
            if(i-1>=0){
                tmp.push(pixelColors[i-1][j][pos]);
            }
            if(i+1<height){
                tmp.push(pixelColors[i+1][j][pos]);
            }
            if(j-1>=0){
                tmp.push(pixelColors[i][j-1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j-1][pos]*0);
                }
                if(i+1<height){
                   tmp.push(pixelColors[i+1][j-1][pos]*0);
                }
            }
            if(j+1<width){
                tmp.push(pixelColors[i][j+1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j+1][pos]*0);
                }
                if(i+1<height){
                    tmp.push(pixelColors[i+1][j+1][pos]*0);
                }
            }
            tmp.push(pixelColors[i][j][pos]*(-4));
            let total = tmp.reduce((previous,current)=> previous+current);
            row.push(total);
        }
        arr.push(row);
    }
    if(isNegative(arr) == false){
        return arr;
    }
    const mini = minumun(arr);
    const maxi = maximum(arr);
    const newMin = 0;
    const newMax = 255;
    const m = (newMax - newMin)/(maxi - mini);
    const b = newMin - (m*mini);
    let newArr = Transform(arr,m,b);
    return newArr;
}
function applyMask(arrR,arrG,arrB){
    for(let i=0;i<pixelsCopy.length;++i){
        for(let j=0;j<pixelsCopy[0].length;++j){
            pixelsCopy[i][j] = [arrR[i][j],arrG[i][j],arrB[i][j]];
        }
    }
}
function averageFilterIn(width,height,pos){
    let arr = [];
    for(let i = 0; i < height; ++i){
        let row = [];
        for(let j = 0; j < width; ++j){
            let tmp = [];
            if(i-1>=0){
                tmp.push(pixelColors[i-1][j][pos]);
            }
            if(i+1<height){
                tmp.push(pixelColors[i+1][j][pos]);
            }
            if(j-1>=0){
                tmp.push(pixelColors[i][j-1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j-1][pos]);
                }
                if(i+1<height){
                   tmp.push(pixelColors[i+1][j-1][pos]);
                }
            }
            if(j+1<width){
                tmp.push(pixelColors[i][j+1][pos]);
                if(i-1>=0){
                    tmp.push(pixelColors[i-1][j+1][pos]);
                }
                if(i+1<height){
                    tmp.push(pixelColors[i+1][j+1][pos]);
                }
            }
            tmp.push(pixelColors[i][j][pos]);
            let total = Math.round(tmp.reduce((previous,current)=> previous+current)*(1/9));
            row.push(total);
        }
        arr.push(row);
    }
    return arr;
}
function getImg(){
    imgInput.src = URL.createObjectURL(fileInput.files[0]);
    imgInput.classList.add('animation');
    setTimeout(()=> {
        imgInput.classList.remove('animation');
    },500);
    if (typeOfFilter === null || typeOfFilter === "")
        return;
    loadPicture();
}

function Init(){
    fileInput.addEventListener('change',getImg);
    selectList.addEventListener('change',getListValue);
}
Init();

