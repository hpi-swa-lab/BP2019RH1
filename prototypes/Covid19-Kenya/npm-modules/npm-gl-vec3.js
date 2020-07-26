!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).glVec3=t()}}(function(){return function(){return function t(n,r,e){function o(u,i){if(!r[u]){if(!n[u]){var s="function"==typeof require&&require;if(!i&&s)return s(u,!0);if(a)return a(u,!0);var c=new Error("Cannot find module '"+u+"'");throw c.code="MODULE_NOT_FOUND",c}var f=r[u]={exports:{}};n[u][0].call(f.exports,function(t){return o(n[u][1][t]||t)},f,f.exports,t,n,r,e)}return r[u].exports}for(var a="function"==typeof require&&require,u=0;u<e.length;u++)o(e[u]);return o}}()({1:[function(t,n,r){n.exports=function(t,n,r){return t[0]=n[0]+r[0],t[1]=n[1]+r[1],t[2]=n[2]+r[2],t}},{}],2:[function(t,n,r){n.exports=function(t,n){var r=e(t[0],t[1],t[2]),u=e(n[0],n[1],n[2]);o(r,r),o(u,u);var i=a(r,u);return i>1?0:Math.acos(i)};var e=t("./fromValues"),o=t("./normalize"),a=t("./dot")},{"./dot":12,"./fromValues":18,"./normalize":29}],3:[function(t,n,r){n.exports=function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t[2]=Math.ceil(n[2]),t}},{}],4:[function(t,n,r){n.exports=function(t){var n=new Float32Array(3);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n}},{}],5:[function(t,n,r){n.exports=function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t}},{}],6:[function(t,n,r){n.exports=function(){var t=new Float32Array(3);return t[0]=0,t[1]=0,t[2]=0,t}},{}],7:[function(t,n,r){n.exports=function(t,n,r){var e=n[0],o=n[1],a=n[2],u=r[0],i=r[1],s=r[2];return t[0]=o*s-a*i,t[1]=a*u-e*s,t[2]=e*i-o*u,t}},{}],8:[function(t,n,r){n.exports=t("./distance")},{"./distance":9}],9:[function(t,n,r){n.exports=function(t,n){var r=n[0]-t[0],e=n[1]-t[1],o=n[2]-t[2];return Math.sqrt(r*r+e*e+o*o)}},{}],10:[function(t,n,r){n.exports=t("./divide")},{"./divide":11}],11:[function(t,n,r){n.exports=function(t,n,r){return t[0]=n[0]/r[0],t[1]=n[1]/r[1],t[2]=n[2]/r[2],t}},{}],12:[function(t,n,r){n.exports=function(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}},{}],13:[function(t,n,r){n.exports=1e-6},{}],14:[function(t,n,r){n.exports=function(t,n){var r=t[0],o=t[1],a=t[2],u=n[0],i=n[1],s=n[2];return Math.abs(r-u)<=e*Math.max(1,Math.abs(r),Math.abs(u))&&Math.abs(o-i)<=e*Math.max(1,Math.abs(o),Math.abs(i))&&Math.abs(a-s)<=e*Math.max(1,Math.abs(a),Math.abs(s))};var e=t("./epsilon")},{"./epsilon":13}],15:[function(t,n,r){n.exports=function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]}},{}],16:[function(t,n,r){n.exports=function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t[2]=Math.floor(n[2]),t}},{}],17:[function(t,n,r){n.exports=function(t,n,r,o,a,u){var i,s;n||(n=3);r||(r=0);s=o?Math.min(o*n+r,t.length):t.length;for(i=r;i<s;i+=n)e[0]=t[i],e[1]=t[i+1],e[2]=t[i+2],a(e,e,u),t[i]=e[0],t[i+1]=e[1],t[i+2]=e[2];return t};var e=t("./create")()},{"./create":6}],18:[function(t,n,r){n.exports=function(t,n,r){var e=new Float32Array(3);return e[0]=t,e[1]=n,e[2]=r,e}},{}],19:[function(t,n,r){n.exports={EPSILON:t("./epsilon"),create:t("./create"),clone:t("./clone"),angle:t("./angle"),fromValues:t("./fromValues"),copy:t("./copy"),set:t("./set"),equals:t("./equals"),exactEquals:t("./exactEquals"),add:t("./add"),subtract:t("./subtract"),sub:t("./sub"),multiply:t("./multiply"),mul:t("./mul"),divide:t("./divide"),div:t("./div"),min:t("./min"),max:t("./max"),floor:t("./floor"),ceil:t("./ceil"),round:t("./round"),scale:t("./scale"),scaleAndAdd:t("./scaleAndAdd"),distance:t("./distance"),dist:t("./dist"),squaredDistance:t("./squaredDistance"),sqrDist:t("./sqrDist"),length:t("./length"),len:t("./len"),squaredLength:t("./squaredLength"),sqrLen:t("./sqrLen"),negate:t("./negate"),inverse:t("./inverse"),normalize:t("./normalize"),dot:t("./dot"),cross:t("./cross"),lerp:t("./lerp"),random:t("./random"),transformMat4:t("./transformMat4"),transformMat3:t("./transformMat3"),transformQuat:t("./transformQuat"),rotateX:t("./rotateX"),rotateY:t("./rotateY"),rotateZ:t("./rotateZ"),forEach:t("./forEach")}},{"./add":1,"./angle":2,"./ceil":3,"./clone":4,"./copy":5,"./create":6,"./cross":7,"./dist":8,"./distance":9,"./div":10,"./divide":11,"./dot":12,"./epsilon":13,"./equals":14,"./exactEquals":15,"./floor":16,"./forEach":17,"./fromValues":18,"./inverse":20,"./len":21,"./length":22,"./lerp":23,"./max":24,"./min":25,"./mul":26,"./multiply":27,"./negate":28,"./normalize":29,"./random":30,"./rotateX":31,"./rotateY":32,"./rotateZ":33,"./round":34,"./scale":35,"./scaleAndAdd":36,"./set":37,"./sqrDist":38,"./sqrLen":39,"./squaredDistance":40,"./squaredLength":41,"./sub":42,"./subtract":43,"./transformMat3":44,"./transformMat4":45,"./transformQuat":46}],20:[function(t,n,r){n.exports=function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t[2]=1/n[2],t}},{}],21:[function(t,n,r){n.exports=t("./length")},{"./length":22}],22:[function(t,n,r){n.exports=function(t){var n=t[0],r=t[1],e=t[2];return Math.sqrt(n*n+r*r+e*e)}},{}],23:[function(t,n,r){n.exports=function(t,n,r,e){var o=n[0],a=n[1],u=n[2];return t[0]=o+e*(r[0]-o),t[1]=a+e*(r[1]-a),t[2]=u+e*(r[2]-u),t}},{}],24:[function(t,n,r){n.exports=function(t,n,r){return t[0]=Math.max(n[0],r[0]),t[1]=Math.max(n[1],r[1]),t[2]=Math.max(n[2],r[2]),t}},{}],25:[function(t,n,r){n.exports=function(t,n,r){return t[0]=Math.min(n[0],r[0]),t[1]=Math.min(n[1],r[1]),t[2]=Math.min(n[2],r[2]),t}},{}],26:[function(t,n,r){n.exports=t("./multiply")},{"./multiply":27}],27:[function(t,n,r){n.exports=function(t,n,r){return t[0]=n[0]*r[0],t[1]=n[1]*r[1],t[2]=n[2]*r[2],t}},{}],28:[function(t,n,r){n.exports=function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t}},{}],29:[function(t,n,r){n.exports=function(t,n){var r=n[0],e=n[1],o=n[2],a=r*r+e*e+o*o;a>0&&(a=1/Math.sqrt(a),t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a);return t}},{}],30:[function(t,n,r){n.exports=function(t,n){n=n||1;var r=2*Math.random()*Math.PI,e=2*Math.random()-1,o=Math.sqrt(1-e*e)*n;return t[0]=Math.cos(r)*o,t[1]=Math.sin(r)*o,t[2]=e*n,t}},{}],31:[function(t,n,r){n.exports=function(t,n,r,e){var o=r[1],a=r[2],u=n[1]-o,i=n[2]-a,s=Math.sin(e),c=Math.cos(e);return t[0]=n[0],t[1]=o+u*c-i*s,t[2]=a+u*s+i*c,t}},{}],32:[function(t,n,r){n.exports=function(t,n,r,e){var o=r[0],a=r[2],u=n[0]-o,i=n[2]-a,s=Math.sin(e),c=Math.cos(e);return t[0]=o+i*s+u*c,t[1]=n[1],t[2]=a+i*c-u*s,t}},{}],33:[function(t,n,r){n.exports=function(t,n,r,e){var o=r[0],a=r[1],u=n[0]-o,i=n[1]-a,s=Math.sin(e),c=Math.cos(e);return t[0]=o+u*c-i*s,t[1]=a+u*s+i*c,t[2]=n[2],t}},{}],34:[function(t,n,r){n.exports=function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t[2]=Math.round(n[2]),t}},{}],35:[function(t,n,r){n.exports=function(t,n,r){return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t}},{}],36:[function(t,n,r){n.exports=function(t,n,r,e){return t[0]=n[0]+r[0]*e,t[1]=n[1]+r[1]*e,t[2]=n[2]+r[2]*e,t}},{}],37:[function(t,n,r){n.exports=function(t,n,r,e){return t[0]=n,t[1]=r,t[2]=e,t}},{}],38:[function(t,n,r){n.exports=t("./squaredDistance")},{"./squaredDistance":40}],39:[function(t,n,r){n.exports=t("./squaredLength")},{"./squaredLength":41}],40:[function(t,n,r){n.exports=function(t,n){var r=n[0]-t[0],e=n[1]-t[1],o=n[2]-t[2];return r*r+e*e+o*o}},{}],41:[function(t,n,r){n.exports=function(t){var n=t[0],r=t[1],e=t[2];return n*n+r*r+e*e}},{}],42:[function(t,n,r){n.exports=t("./subtract")},{"./subtract":43}],43:[function(t,n,r){n.exports=function(t,n,r){return t[0]=n[0]-r[0],t[1]=n[1]-r[1],t[2]=n[2]-r[2],t}},{}],44:[function(t,n,r){n.exports=function(t,n,r){var e=n[0],o=n[1],a=n[2];return t[0]=e*r[0]+o*r[3]+a*r[6],t[1]=e*r[1]+o*r[4]+a*r[7],t[2]=e*r[2]+o*r[5]+a*r[8],t}},{}],45:[function(t,n,r){n.exports=function(t,n,r){var e=n[0],o=n[1],a=n[2],u=r[3]*e+r[7]*o+r[11]*a+r[15];return u=u||1,t[0]=(r[0]*e+r[4]*o+r[8]*a+r[12])/u,t[1]=(r[1]*e+r[5]*o+r[9]*a+r[13])/u,t[2]=(r[2]*e+r[6]*o+r[10]*a+r[14])/u,t}},{}],46:[function(t,n,r){n.exports=function(t,n,r){var e=n[0],o=n[1],a=n[2],u=r[0],i=r[1],s=r[2],c=r[3],f=c*e+i*a-s*o,l=c*o+s*e-u*a,d=c*a+u*o-i*e,p=-u*e-i*o-s*a;return t[0]=f*c+p*-u+l*-s-d*-i,t[1]=l*c+p*-i+d*-u-f*-s,t[2]=d*c+p*-s+f*-i-l*-u,t}},{}]},{},[19])(19)});