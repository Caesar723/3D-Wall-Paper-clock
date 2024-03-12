// 获取 canvas 元素并创建 WebGL 上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const Limit_Plance=[0,0,6000,10000]



//##block class##//

const corners=[//x y z
    [1,1,1],
    [1,1,-1],
    [1,-1,1],
    [1,-1,-1],
    [-1,1,1],
    [-1,1,-1],
    [-1,-1,1],
    [-1,-1,-1],

];
const connect_index=[
    [0,1],
    [2,3],
    [4,5],
    [6,7],
    [0,2],
    [1,3],
    [4,6],
    [5,7],
    [0,4],
    [1,5],
    [2,6],
    [3,7]
]
// const plane_indexs=[
//     [0,1,3,2],
//     [6,7,5,4],
//     [4,5,1,0],
//     [2,3,7,6],
//     [0,2,6,4],
//     [5,7,3,1],
// ]
const plane_indexs=[
    [2,3,1,0],
    [4,5,7,6],
    [0,1,5,4],
    [6,7,3,2],
    [4,6,2,0],
    [1,3,7,5],
]

//##Block##//
class Block{

    constructor(position,size){//position =[x,y,z]
        this.position=position;
        this.angle_x=0;
        this.angle_y=0;
        this.angle_z=0;
        this.vel_x=getRandomNumber(-2,2);
        this.vel_y=getRandomNumber(-2,2);
        this.vel_z=getRandomNumber(-2,2);
        this.force_x=0;
        this.force_y=0;
        this.force_z=0;
        this.points=this.get_org_position(size);
        this.arr_poses=NaN;
        this.planes=this.set_plane();
        this.destination_flag=false;
        this.destination=[0,0,0];
        
        
    }

    get_org_position(size){
        const arr_x=[];
        const arr_y=[];
        const arr_z=[];

        for (const i in corners){
            
            arr_x.push(corners[i][0]*size);
            arr_y.push(corners[i][1]*size);
            arr_z.push(corners[i][2]*size);
        }

        return math.matrix([arr_x,arr_y,arr_z,])
    }

    get_position_points(){
        const xy_rotate=math.multiply(rotateX(this.angle_x),rotateY(this.angle_y));
        const xyz_rotate=math.multiply(xy_rotate,rotateZ(this.angle_z));
        
        const pos_rotate=math.multiply(xyz_rotate,this.points);

        const final_points=[]
        for (let col = 0; col <= corners.length-1; col++){
            const final_point=[]
            for (let row = 0; row <= 2; row++){
                
                final_point.push(pos_rotate.get([row,col])+this.position[row]);
            }
            final_points.push(final_point);
            
        }
        return final_points;

    }

    set_plane(){
        const planes=[];
        for (const plane_index in plane_indexs){
            const plane=new Plane(plane_indexs[plane_index]);
            planes.push(plane);
        }
        return planes;
    }

    update(){
        // this.angle_y=block.angle_y+0.01;
        // this.angle_z=block.angle_z+0.01;
        this.change_velocity();
        
        // this.force_x=getRandomNumber(-2,2)
        // this.force_y=getRandomNumber(-2,2)
        // this.force_z=getRandomNumber(-2,2)
        if(this.destination_flag){
            this.destination_reach();
            this.check_destination();
        }
        
        this.vel_x=+this.force_x+this.vel_x;
        this.vel_y=+this.force_y+this.vel_y;
        this.vel_z=+this.force_z+this.vel_z;
        this.position[0]=this.position[0]+this.vel_x;
        this.position[1]=this.position[1]+this.vel_y;
        this.position[2]=this.position[2]+this.vel_z;
        if (this.destination_flag==true){
            this.total_dis_x=this.total_dis_x+this.vel_x;
            this.total_dis_y=this.total_dis_y+this.vel_y;
            this.total_dis_z=this.total_dis_z+this.vel_z;
        }
        this.limit_velocity()
        
        this.arr_poses=this.get_position_points();
        for (const plane_index in this.planes){
            this.planes[plane_index].arr=this.arr_poses;
        
        }
    }

    draw(camera){
        if (camera.check_limit(this.position)){
            return;
        }
        this.planes.sort(function(a,b){
            return b.mid_point()[2]-a.mid_point()[2];
        })
        for (const plane_index in this.planes){
            this.planes[plane_index].draw(camera,this.arr_poses);
        }
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;           
        
        
        for (const points_index in connect_index){
            
            const x_start=this.arr_poses[connect_index[points_index][0]][0]
            const y_start=this.arr_poses[connect_index[points_index][0]][1]
            const z_start=this.arr_poses[connect_index[points_index][0]][2]
            const x_end=this.arr_poses[connect_index[points_index][1]][0]
            const y_end=this.arr_poses[connect_index[points_index][1]][1]
            const z_end=this.arr_poses[connect_index[points_index][1]][2]
            ctx.beginPath();
            ctx.moveTo(cx + camera.similar_tri(x_start,z_start), cy + camera.similar_tri(y_start,z_start));
            ctx.lineTo(cx + camera.similar_tri(x_end,z_end), cy + camera.similar_tri(y_end,z_end));
            ctx.stroke();
            

        }
    }


    change_velocity(){
        if (Limit_Plance[0]+Limit_Plance[3]/2<this.position[0] || Limit_Plance[0]-Limit_Plance[3]/2>this.position[0]){
            this.vel_x=-this.vel_x
            this.force_x=-this.force_x
        }
       
        if (Limit_Plance[1]+Limit_Plance[3]/2<this.position[1] || Limit_Plance[1]-Limit_Plance[3]/2>this.position[1]){
            this.vel_y=-this.vel_y
            this.force_y=-this.force_y
        }
       
        if (Limit_Plance[2]+Limit_Plance[3]/2<this.position[2] || Limit_Plance[2]-Limit_Plance[3]/2>this.position[2]){
            this.vel_z=-this.vel_z
            this.force_z=-this.force_z
        }

    }

    limit_velocity(){
        var max_vel=0;
        if (this.destination_flag==true){
            max_vel=3000;
        }
        else{
            max_vel=10;
        }
        
        if (this.vel_x>max_vel){
            this.vel_x=max_vel;
        }
        if (this.vel_x<-max_vel){
            this.vel_x=-max_vel;
        } 
        if (this.vel_y>max_vel){
            this.vel_y=max_vel;
        }
        if (this.vel_y<-max_vel){
            this.vel_y=-max_vel;
        } 
        if (this.vel_z>max_vel){
            this.vel_z=max_vel;
        }
        if (this.vel_z<-max_vel){
            this.vel_z=-max_vel;
        } 
    }
    destination_set(position){
        this.destination_flag=true;
        this.destination=position;
        this.total_dis_x=0;
        this.total_dis_y=0;
        this.total_dis_z=0;
        this.last_pos_x=this.position[0];
        this.last_pos_y=this.position[1];
        this.last_pos_z=this.position[2];
    }
    destination_reach(){
        const k_p=0.001;
        const k_i=0.0000001;
        const k_d=0.05;

        
        const diff_x=-(this.position[0]-this.last_pos_x)
        const diff_y=-(this.position[1]-this.last_pos_y)
        const diff_z=-(this.position[2]-this.last_pos_z)
        this.last_pos_x=this.position[0];
        this.last_pos_y=this.position[1];
        this.last_pos_z=this.position[2];
        const err_x=this.destination[0]-this.position[0];
        const err_y=this.destination[1]-this.position[1];
        const err_z=this.destination[2]-this.position[2];

        this.force_x=this.calculate_force_pid(k_p,k_i,k_d,err_x,diff_x,this.total_dis_x)
        this.force_y=this.calculate_force_pid(k_p,k_i,k_d,err_y,diff_y,this.total_dis_y)
        this.force_z=this.calculate_force_pid(k_p,k_i,k_d,err_z,diff_z,this.total_dis_z)

    }
    calculate_force_pid(p,i,d,error,vel,total_dis){
        return p * error + i * total_dis + d * vel
    }

    check_destination(){
        const range=1;
        if (math.abs(this.destination[0]-this.position[0])<range && math.abs(this.destination[1]-this.position[1])<range  && math.abs(this.destination[2]-this.position[2])<range && math.abs(this.vel_x)<range &&  math.abs(this.vel_y)<range &&  math.abs(this.vel_z)<range){

            this.destination_flag=false;
        }
    }

}
//## Plane ##//


class Plane{

    constructor(indexs){
        this.indexs_plane=indexs;
        this.arr=NaN;

    }

    get_point(index){
        return [this.arr[index][0],this.arr[index][1],this.arr[index][2]];
    }

    normal_vector(){
        const vec1=[this.arr[this.indexs_plane[1]][0]-this.arr[this.indexs_plane[3]][0],this.arr[this.indexs_plane[1]][1]-this.arr[this.indexs_plane[3]][1],this.arr[this.indexs_plane[1]][2]-this.arr[this.indexs_plane[3]][2]];
        const vec2=[this.arr[this.indexs_plane[0]][0]-this.arr[this.indexs_plane[2]][0],this.arr[this.indexs_plane[0]][1]-this.arr[this.indexs_plane[2]][1],this.arr[this.indexs_plane[0]][2]-this.arr[this.indexs_plane[2]][2]];
        const vec_normal=(math.cross(vec1,vec2));
        return vec_normal;
    }

    mid_point(){
        const mid_p=[(this.arr[this.indexs_plane[1]][0]+this.arr[this.indexs_plane[3]][0])/2,(this.arr[this.indexs_plane[1]][1]+this.arr[this.indexs_plane[3]][1])/2,(this.arr[this.indexs_plane[1]][2]+this.arr[this.indexs_plane[3]][2])/2];
        return mid_p;
    }

    angle_from_cam(camera){
        const vectorA=this.normal_vector()
        const vectorB=camera.get_vector()
        const dot = math.dot(vectorA, vectorB);
        

        // Calculate the magnitude (norm) of each vector
        const normA = math.norm(vectorA);
        const normB = math.norm(vectorB);

        // Calculate the cosine of the angle using the dot product and magnitudes
        const cosTheta = dot / (normA * normB);
        // Use the acos function to find the angle in radians and then convert to degrees
        const angleRadians = math.acos(cosTheta);
        
        const angleDegrees = angleRadians * (180 / math.PI);

        return angleDegrees;
    }
    angle_from_cam_2(camera){
        const vectorA=this.normal_vector();
        const plane_pos=this.mid_point();
        const com_pos=camera.position
        const vectorB=[plane_pos[0]-com_pos[0],plane_pos[1]-com_pos[1],plane_pos[2]-com_pos[2]]
        const dot = math.dot(vectorA, vectorB);
        

        // Calculate the magnitude (norm) of each vector
        const normA = math.norm(vectorA);
        const normB = math.norm(vectorB);

        // Calculate the cosine of the angle using the dot product and magnitudes
        const cosTheta = dot / (normA * normB);
        // Use the acos function to find the angle in radians and then convert to degrees
        const angleRadians = math.acos(cosTheta);
        
        const angleDegrees = angleRadians * (180 / math.PI);

        return angleDegrees;
    }

    most_close_far_points(){
        const arr_indexs=[];
        for (const i in this.indexs_plane){
            arr_indexs.push([i,this.arr[this.indexs_plane[i]]]);
        }
        arr_indexs.sort(function(a,b){
            return a[1][2]-b[1][2];
        });
        
        return [arr_indexs[0],arr_indexs[3]]//max, min color


    }

    light_bright(pos_z){
        const new_pos=pos_z-POSITION[2];
        const max=(((SIZE*((2)**0.5))**2+SIZE**2)**0.5)*2;
        const min=-(((SIZE*((2)**0.5))**2+SIZE**2)**0.5);
        const diff=new_pos-min;
        const light=255-255*(diff/max);
        
        return light;
    }

    bright_min(max_light,light_middle){
        
        return light_middle-(max_light-light_middle)
    }
    draw(camera){
        
        const angle=this.angle_from_cam_2(camera);
        const light=((255-255*angle/360)*(1-this.mid_point()[2]/(Limit_Plance[3]+Limit_Plance[2]))).toString();
        const new_points_pos=[];
        
        
        
        ctx.beginPath();
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;       
        for (const index_plane in this.indexs_plane){
            const x_start=this.arr[this.indexs_plane[index_plane]][0]
            const y_start=this.arr[this.indexs_plane[index_plane]][1]
            const z_start=this.arr[this.indexs_plane[index_plane]][2]

            const end_x=cx + camera.similar_tri(x_start,z_start)
            const end_y=cy + camera.similar_tri(y_start,z_start)
            if (index_plane==0) {
                ctx.moveTo(end_x, end_y); 
            }
            else{
                ctx.lineTo(end_x, end_y);    
            }
            new_points_pos.push([end_x, end_y])
        }
        ctx.closePath();  

        const max_min_points=this.most_close_far_points();
        
        var gradient = ctx.createLinearGradient(...new_points_pos[max_min_points[0][0]], ...new_points_pos[max_min_points[1][0]]);
        
        const light_max=this.light_bright(max_min_points[0][1][2]);
        const light_min=this.light_bright(max_min_points[1][1][2]);
        
        gradient.addColorStop(0, "rgb("+light+","+light+","+light+",0.7)");
        gradient.addColorStop(1, "rgb("+light+","+light+","+light+",0.7)");
        ctx.fillStyle = gradient;
        ctx.fill();
    }

}


//## Camera##//

class Camera{

    constructor(position){
        this.vector_x=0
        this.vector_y=0
        this.vector_z=1

        this.position=position

        this.dis_from_screen=900
    }

    get_vector(){
        return [this.vector_x,this.vector_y,this.vector_z]
    }

    set_vector(x,y,z){
        this.vector_x=x
        this.vector_y=y
        this.vector_z=z
    }

    similar_tri(x_or_y,z){
        return x_or_y*(this.dis_from_screen/(z-this.position[2]))
    }

    get_limit(){
        const k_x=(window.innerWidth/2)/this.dis_from_screen
        const b_x=this.position[2]-this.position[0]*k_x

        const k_y=(window.innerHeight/2)/this.dis_from_screen
        const b_y=this.position[2]-this.position[1]*k_y

        return [k_x,b_x,k_y,b_y]
    }

    check_limit(position){
        const k_x=(window.innerWidth/2)/this.dis_from_screen
        const b_x=this.position[2]-this.position[0]*k_x

        const k_y=(window.innerHeight/2)/this.dis_from_screen
        const b_y=this.position[2]-this.position[1]*k_y
        
        if (position[2]<k_x*position[0]+b_x || position[2]<-k_x*position[0]+b_x
            || position[2]<k_y*position[1]+b_y|| position[2]<-k_y*position[1]+b_y){
                return true;
        }
        else{
            return false;
        }
    }
}

//##space##//
class Space{
    constructor(){
        this.arr_cube=[];
        for  (var i = 0; i <= 159; i++){
            const size=150;
            const position=[getRandomNumber(-window.innerWidth,window.innerWidth),getRandomNumber(-window.innerHeight,window.innerHeight),3000+2000*math.random()];
            const block=new Block(position,size)
            //block.destination_set([-1000,1000,6000]);
            this.arr_cube.push(block)
        }
        
        this.arr_cube.push(new Block([0,0,4000],150));
        

    }

    draw(camera){
        this.arr_cube.sort(function(a,b){
            return b.position[2]-a.position[2];
        })
        for (var cube in this.arr_cube){
            this.arr_cube[cube].draw(camera)
        }
    }

    update(){
        for (var cube in this.arr_cube){
            this.arr_cube[cube].update()
        }
    }

    set_destination(string){
        const z_dis=7000;
        const z_dis_assume=50;
        console.log(string)
        const matrix = getTextMatrix(string, 70, 50);
        console.log(matrix);
        var index=0;
        for(const col in matrix){
            for (const row in matrix[col]){
                if (matrix[col][row]){
                    const x_real=(row-25)*z_dis/z_dis_assume;
                    const y_real=-(25-col)*z_dis/z_dis_assume;
                    this.arr_cube[index].destination_set([x_real,y_real,z_dis]);
                    index=index+1;
                    

                }
            }
        }
    }


}

//##Light Ball##//

//##matrix rotate##//
function rotateX(angle){
    const matrix =math.matrix([
        [1, 0,0],
        [0, math.cos(angle),-math.sin(angle)],
        [0, math.sin(angle),math.cos(angle)],
        ]);
    return matrix
};

function rotateY(angle){
    const matrix =math.matrix([
        [math.cos(angle), 0,math.sin(angle)],
        [0, 1,0],
        [-math.sin(angle), 0,math.cos(angle)],
        ]);
    return matrix
    
};
function rotateZ(angle){
    const matrix =math.matrix([
        [math.cos(angle),-math.sin(angle),0],
        [math.sin(angle),math.cos(angle),0 ],
        [0,0,1 ],
        ]);
    return matrix
    
};
function getRandomNumber(min, max) {
    return math.random() * (max - min) + min;
}

function getTextMatrix(text, width, height) {
    const offscreenCanvas = new OffscreenCanvas(width, height);
    let ctx = offscreenCanvas.getContext("2d");

    // 设置字体大小和类型
    ctx.font = "20px Arial";
    // 在画布上绘制文本
    ctx.fillText(text, 0, 30);

    let imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    let matrix = [];

    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            let red = data[(width * y + x) * 4];
            let green = data[(width * y + x) * 4 + 1];
            let blue = data[(width * y + x) * 4 + 2];
            let alpha = data[(width * y + x) * 4 + 3];
            
            let isBlack = (red ===0 && green ===0 && blue ===0 && alpha === 255) ? 1 : 0;
            row.push(isBlack);
        }
        matrix.push(row);
    }
    return matrix;
}

function getCurrentTimeString() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // 将小时和分钟格式化为两位数
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes;
}


var current_time=getCurrentTimeString()
var SIZE=150;
var POSITION=[0,0,3000];
const block=new Block(POSITION,SIZE)
const camera=new Camera([0,0,-50])
//##functions##//
const space=new Space()
space.set_destination("caesar");
function draw_picture(){
    const new_time=getCurrentTimeString()
    if (new_time!=current_time){
        current_time=getCurrentTimeString();
        space.set_destination(current_time);
        console.log(1)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    space.update()
    space.draw(camera)
    //console.log(getTextMatrix("22:54",50,50));
    // b.angle_x=b.angle_x+0.01
    
    requestAnimationFrame(draw_picture);
    
}

draw_picture();