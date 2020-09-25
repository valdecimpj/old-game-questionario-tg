import Camera from './camera.js';
import ImageManager from './image-manager.js';
export default class GraphicEngine{
	
    constructor(canvas){
        this.camera;
        this.canvas=canvas;
        this.gl;
        this.imageManager=new ImageManager(this);
        this.programInfo;
        this.buffers;
        this.init();
    }

    init(){
        this.prepareContext();
        this.initProgram(this.gl);
        this.initBuffers(this.gl);
        this.initTextures(this.gl)
        this.setupSquareDrawning(this.gl);//a modificar se usar outros meshes
    }

    setupSquareDrawning(gl){
        this.setupProgramDrawning(gl,this.buffers.squareBuffer);
    }

    setupProgramDrawning(gl,buffers){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.normal);
        gl.vertexAttribPointer(this.programInfo.attribLocations.vertexNormal,3,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.position);
        gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition,3,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.textureCoord); //talvez precise ser mudado
        gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord,2,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffers.indices);
        gl.useProgram(this.programInfo.program);
        gl.uniform1i(this.programInfo.uniformLocations.sampler,0);
    }

    draw(obj){
        this.manageTexture(this.gl,obj);
        this.prepareMatrix(this.gl,this.camera,obj);
        this.setupProgramDrawning(this.gl,this.buffers.squareBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.buffers.squareBuffer.indiceCount, this.gl.UNSIGNED_SHORT,0); //TODO lidar com o número de vértices de uma forma mais genérica
    }

    drawPickable(obj){
        let gl=this.gl;
        var pixel=new Uint8Array([obj.r,obj.g,obj.b,255]);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,pixel);

        this.prepareMatrix(this.gl,this.camera,obj);
        this.setupProgramDrawning(this.gl,this.buffers.squareBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.buffers.squareBuffer.indiceCount, this.gl.UNSIGNED_SHORT,0); //TODO lidar com o número de vértices de uma forma mais genérica
    }

    //TODO esse método está fadado a ser modificado drasticamente a fim de não carregar a textura novamente todo draw
    //além disso, falta fazer ele pegar tal imagem de algum objeto que lide com as imagens baixadas do servidor
    manageTexture(gl,obj){
        //gl.activeTexture(gl.TEXTURE0);
        //TODO fazer benchmark depois para descobrir se vale a pena salvar os buffers ou se é mais rápido escrever as imagens em um buffer só
        var image = this.imageManager.getImage(obj.imageName); 
        this.prepareTexture(gl,image);
    }

    createNewTexture(image){
        let gl = this.gl;
        let texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, image);
        if(this.isPowerOfTwo(image.width)&&this.isPowerOfTwo(image.height))
            gl.generateMipmap(gl.TEXTURE_2D);
        else{
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        return texture;
    }

    prepareTexture(gl,image){
        //gambiarra provisória a seguir
        if(image.isLoaded){
            gl.bindTexture(gl.TEXTURE_2D,image.texture);
            /*gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, image);
            if(this.isPowerOfTwo(image.width)&&this.isPowerOfTwo(image.height))
                gl.generateMipmap(gl.TEXTURE_2D);
            else{
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }*/
        }else{
            gl.bindTexture(gl.TEXTURE_2D,this.texture);
        }
    }

    prepareContext(){
        this.camera = new Camera();
        this.gl=this.canvas.getContext('webgl');
        var gl = this.gl;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        if(!gl)
            alert('Seu dispositivo ou navegador não suporta WebGL');
    }

    //TODO fazer as matrizes persistirem??
    //isso reduziria o tempo levado para criá-las, assim como para executar gl.uniformMatrix4fv
    //gl.uniformMatrix4fv só está sendo executado pois as matrizes não persistem
    prepareMatrix(gl,camera,obj){
        var fieldOfView=camera.fov*Math.PI/180;
        var aspect=gl.canvas.clientWidth/gl.canvas.clientHeight;
        var zNear=1;
        var zFar=100.0;

        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

        var modelViewMatrix=mat4.create();
        var normalMatrix=mat4.create();
        mat4.invert(normalMatrix,modelViewMatrix);
        mat4.transpose(normalMatrix,normalMatrix);
        mat4.translate(modelViewMatrix,modelViewMatrix,[0,0,-camera.zoom]);
        mat4.rotate(modelViewMatrix,modelViewMatrix,camera.rx*Math.PI/180,[1,0,0]);
        mat4.rotate(modelViewMatrix,modelViewMatrix,camera.ry*Math.PI/180,[0,1,0]);
        mat4.rotate(modelViewMatrix,modelViewMatrix,camera.rz*Math.PI/180,[0,0,1]);
        mat4.translate(modelViewMatrix,modelViewMatrix,[-camera.x,-camera.y,camera.z+camera.zoom]);
        mat4.translate(modelViewMatrix,modelViewMatrix,[obj.x,obj.y,-obj.z])
        mat4.rotate(modelViewMatrix,modelViewMatrix,obj.rx*Math.PI/180,[1,0,0]);
        mat4.rotate(modelViewMatrix,modelViewMatrix,obj.ry*Math.PI/180,[0,1,0]);
        mat4.rotate(modelViewMatrix,modelViewMatrix,obj.rz*Math.PI/180,[0,0,1]);
        //mat4.translate(modelViewMatrix,modelViewMatrix,[obj.ox,obj.oy,obj.oz]); KILL ME
        mat4.scale(modelViewMatrix,modelViewMatrix,[obj.sx,obj.sy,obj.sz]);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.normalMatrix,false,normalMatrix);
    }

    initProgram(gl){
        var shaderProgram=this.initShaders(gl);
        var programInfo={
            program:shaderProgram,
            attribLocations:{
                vertexPosition:gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexNormal:gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord:gl.getAttribLocation(shaderProgram,'aTextureCoord')
            },
            uniformLocations:{
                projectionMatrix:gl.getUniformLocation(shaderProgram,'uProjectionMatrix'),
                modelViewMatrix:gl.getUniformLocation(shaderProgram,'uModelViewMatrix'),
                normalMatrix:gl.getUniformLocation(shaderProgram,'uNormalMatrix'),
                sampler:gl.getUniformLocation(shaderProgram,'uSampler')
            },
        }
        this.programInfo= programInfo;
    }
    initShaders(gl){
        var vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;

            uniform mat4 uNormalMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;

            void main(void) {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
              vTextureCoord = aTextureCoord;

              // Apply lighting effect

              highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
              highp vec3 directionalLightColor = vec3(1, 1, 1);
              highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

              highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

              highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
              vLighting = ambientLight + (directionalLightColor * directional);
            }
        `;

        var fsSource = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;

            uniform sampler2D uSampler;

            void main(void) {
                highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

                gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            }
        `;

        var vertexShader = this.loadShader(gl,gl.VERTEX_SHADER,vsSource);
        var fragmentedShader = this.loadShader(gl,gl.FRAGMENT_SHADER,fsSource);

        var shaderProgram=gl.createProgram();
        gl.attachShader(shaderProgram,vertexShader);
        gl.attachShader(shaderProgram,fragmentedShader);
        gl.linkProgram(shaderProgram);
        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            alert('Falha ao criar shader program: '+gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

    loadShader(gl,type,source){

        var shader = gl.createShader(type);
		gl.shaderSource(shader,source);
		gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    initTextures(gl){
        this.texture=gl.createTexture();
        var pixel=new Uint8Array([0,0,255,255]);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
    }

    initBuffers(gl){
        var buffers={
            squareBuffer:this.initSquareBuffer(gl),
        }
        this.buffers=buffers;
    }

    initSquareBuffer(gl){
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        var positions=[
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions), gl.STATIC_DRAW);

        var textureCoordBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,textureCoordBuffer);

        var textureCoords=[
            // Front
            0.0,  1.0,
            1.0,  1.0,
            1.0,  0.0,
            0.0,  0.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.STATIC_DRAW);

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer)

        var vertexNormals=[
            // Front
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexNormals),gl.STATIC_DRAW);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);

        var indices=[
            0,  1,  2,      0,  2,  3,    // front
        ];

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices) ,gl.STATIC_DRAW);

        return {
            position: positionBuffer,
            normal: normalBuffer,
            textureCoord:textureCoordBuffer,
            indices:indexBuffer,
            indiceCount:indices.length
        }
    }

    isPowerOfTwo(n){
        return n && (n & (n - 1)) === 0;
    }

    clear(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}