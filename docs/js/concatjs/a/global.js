function AllFunc() {
    "use strict";
    function _all_func() {
    }
    _all_func.prototype = {
		//转场函数
		GoPage:null,
		//加载器,参数为地址,挂载点，回调，模版自定义ID，与模版加载后存放点，存在temlp.key下面
		Load:function(url,dom,fuc,id,key){
			if(dom){this.PageFuc[$(dom).index()]={"fuc":fuc,"dom":$(dom),"url":url,'key':key?key:false,ks:false,'id':id?id:false};}else{
				var o=$.extend({warpId:'',id:'',data:'',fuc:false,ks:true},url);
				if(!o.warpId){console.log('warpId字段一定要指定ID！');}else{
					this.BannaDom.append('<div class="body-data" id="'+o.warpId.slice(1)+'"> </div>');
					var appendDom=$(o.warpId);
					this.BannaArr.push({a:appendDom,b:0});
					this.PageFuc[appendDom.index()]=o;
					o.warpId=appendDom;
					}
				
				
				}
			},
		//各分页面数据挂载点
		AllData:{},
		//模版缓存点
		temlp:{},
		PageFuc:{},
		//登录信息存放点
		LoginInfo:{},
		TipString:{tip:null},
		//用户提示，该提示是全屏遮罩的。可以指定时间,
		Tip:function(str,time){
			var that=this;
			that.TipString.tip=str;
			that.LdDom.addClass("loading-tip-show");
			setTimeout(function(){
				that.LdDom.removeClass("loading-tip-show");
				},time?time:1600);
			},
		//选择提示弹窗，第一个参数为提示的内容，第二个为用户点确认时的回调
		PopupTip:function(str,fuc){
			this.TipString.selecTip=str;
			this.PopupFuc.fuc=fuc;
			this.LdDom.addClass("bom-tip-show");
			},
		PopupFuc:{cc:function(d){
			d.LdDom.removeClass("bom-tip-show");
			},cf:function(d){
				d.PopupFuc.cc(d);
				d.PopupFuc.fuc();
				d.PopupFuc.fuc=function(){};
				},fuc:function(){}},
		//ajax二次封装
        MyAjax: function(met, url, suc, err, data,noLoad) {
			var that=this;
			if(!noLoad){that.LdShow();}
            met = parseInt(met, 10);
            met = isNaN(met) ? 0 : met > 3 ? 3 : met < 0 ? 0 : met;
            data = data ? data: null;
            var m = ["GET", "POST", "PUT", "DELETE"];
            var cy = "application/x-www-form-urlencoded; charset=UTF-8";
            if (met > 0) {
                if (data && (typeof(data) === "object" && typeof(data.append) === "function")) {
                    cy = false;
                }
				if(data&&(typeof(data)==="string")){
					cy='application/json';
					}
            }
            $.ajax({
                type: m[met],
                url: url,
                contentType: cy,
                data: data,
                cache: false,
                processData: cy ? true: false,
                xhrFields: {
                    withCredentials: true
                },
                error: function(){that.LdHide();err();},
                success: function(d){
					if(!noLoad){that.LdHide();}
					try{d=JSON.parse(d);}catch(e){}
					suc(d);
					}
            });

        },
		//get请尔封装，如过第四个参数为true,刚不出自动出现loading与loading自动消失，默认是自动出现loading的
		MyGet:function(url,suc,data,noLoad){
			var that=this;	
			this.MyAjax(0,url,suc,function(){that.Tip("网络错误");},data,noLoad);
			},
		//同get请尔
		MyPost:function(url,suc,data,noLoad){
			var that=this;
			this.MyAjax(1,url,suc,function(){that.Tip("网络错误");},data,noLoad);
			},
		//得到hash对像，会把url上面的hash封装成一个对像返回
        GetHs: function(str) {
            var url = str ? str: location.hash;
            var theRequest = {};
            var strs = url.slice(1).split("&");
            if (strs.length > 0 && strs[0] !== "") {
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
		//会把url查询部分封装成一个对像返回
		GetSearch:function(){
			return this.GetHs(location.search);
			},
		//数组查找，返回含有关键字的元素集合（数组），第一个为被查找的数组，每二个为查找的关键字，支持数组内容是一个对像，但需传key值，
		search:function(arr,str,key){
			var len = arr.length;
			key=key||'orgUnitName';
			var temp_arr=[];
			var temp_str='';
			for(var i=0;i<len;i++){
				if(typeof(arr[i])==='object'){temp_str=arr[i][key];}else{temp_str=arr[i];}
				temp_str+='';
				if(temp_str.indexOf(str)>=0){temp_arr.push(arr[i]);}
				}
			
			if(temp_arr.length===0){temp_arr=false;}
			return temp_arr;
			},
		//ajax返回值简易判断函数
        ResOk: function(d, fuc) {
            if (parseInt(d.status, 10) === 0) {
                fuc(d.data);
            } else {
				this.LdHide();
                this.Tip(d.message?d.message:"获取数据失败，请稍后重试！！");
            }
        },
		direction:false,
        //出现全屏loading
        LdShow: function() {
            this.LdDom.addClass("global_show");
        },
		LdDom:$("#all-bom-warp"),
        //loading消失
        LdHide: function() {
            this.LdDom.removeClass("global_show");
        },
		//切页的所有索引
		BannaArr:[],
		//切页历史记录索引，存放了可返回页面的索引
		Hostory:[0],
		BannaDom:null,
		//页面传参并跳转接口，是传参过去，并自动跳转。
		Ref:function(obj,refFuc){
		   var that=this;
		   this.AllData[obj.nameKey]=this.AllData[obj.nameKey]?this.AllData[obj.nameKey]:{};
		   that.AllData[obj.nameKey][obj.dataKey]=obj.data;
		   this.AllData[obj.nameKey][obj.fucKey]=function(data,fuc){
			   that.AllData[obj.nameKey][obj.dataKey]=$.extend(obj.data,data||{});
			   if(refFuc){
				   refFuc();
				   }
			   that.GoPage(obj.id);
			   if(fuc){fuc();}
			   };
		   },
		//到底部判断函数，dom是原生的dom,height,是离底部还有多远就判定到底部了。fuc是回调 
		IsLast:function(dom, height, fuc) {
    		var d = dom,h = height,domH = dom.offsetHeight;
    		fuc = fuc ||function() {};
    		function scroll(f) {
        		var beforeScrollTop = d.scrollTop,scro_ks = 0;
        		d.addEventListener("scroll",
        		function() {
            		var afterScrollTop = d.scrollTop,delta = afterScrollTop - beforeScrollTop;
            		if (delta === 0) {return false;}
            		if (scro_ks === 0) {
                		scro_ks = 1;
                		f(delta > 0 ? "down": "up"); 
						setTimeout(function() { scro_ks = 0;},100);
            	}
            	beforeScrollTop = afterScrollTop;
        		},false);
    		}
    		scroll(function(direction) {if (direction === 'down' && fuc) {setTimeout(function() {if (d.scrollHeight - d.scrollTop < domH + h) {fuc();}},200);}});
		},
		//Vue的一些快捷方式
		V:function(id,data,ms,wh){
			wh=wh||{};
			var tempWh={};
			$.each(wh,function(a,b){
				tempWh[a]={'handler':b};
				});
			var vm=new Vue({el:id,data:data,methods:ms,watch:tempWh});
			return vm;
			},
		N:function(v,fuc){
			v.$nextTick(fuc);
			},
		F:function(key,fuc){Vue.filter(key,fuc);}
    };
    return window.init ? window.init:window.init=new _all_func();
}

(function() {
    'use strict'; 
	var page_n = 0;
	var init =new AllFunc();
	

    //全局页面转场 
    function router_div(id) {
		var warpDom=$(id);
        warpDom.addClass('data-warp');
        var d = $(id + ">div");
        d.addClass("body-data");
		init.BannaDom=warpDom;
		var banna_z=init.BannaArr;
		var re_z=init.Hostory;
		var now_dom=-1;
		d.each(function(){
			banna_z.push({a:$(this),b:0});
			});
     $(window).on("hashchange",
        function() { 
           set_banna(SetOption(init.GetHs().page,init.direction));
        });
		var p_n=SetOption(init.GetHs().page);
		re_z[0]=p_n;
		now_dom=p_n;
	    page_n = p_n;
		setTimeout(function(){set_banna(p_n,init.direction);},0);
		function SetOption(str){
			var n=parseInt(str,10);
			var ks=isNaN(n);
			n=ks?re_z[0]:(n>banna_z.length-1)?re_z[0]:n;
			return n;
			}
		banna_z[p_n].a.addClass("show-banna now-show").css("z-index", 10);
        function set_banna(n,dir) {
            var l = re_z.length;
			var temp_n=0;
			var temp_n2=0;
			init.direction=dir?dir:init.direction;
			if(init.direction){
				if(init.direction==='up'){
					warpDom.attr('class','all-warp all-warp-up transition-none');
					}
				if(init.direction==='down'){
					warpDom.attr('class','all-warp all-warp-down transition-none');
					}
				if(init.direction==='right'){
					warpDom.attr('class','all-warp transition-none');
					}
				}else{
					warpDom.attr('class','all-warp transition-none');
					}
            if (typeof(n)!=='undefined'&&n!==false) {
			    n=typeof(n)!=="number"?$(n).index():SetOption(n);
				if(n===now_dom){
					SetRen();
					return;}else{
					var this_ks=false;
					$.each(re_z,function(a,b){
						if(n===b){
							this_ks=true;
							return false;
							}
						});
					if(!this_ks){
						banna_z[re_z[l - 1]].b = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
						
						now_dom=n;
						temp_n=re_z[l - 1];
						setTimeout(function(){
							warpDom.removeClass('transition-none');
							banna_z[n].a.addClass("show-banna now-show").css("z-index", 10 + l);
							banna_z[temp_n].a.removeClass("now-show");
							},17);
						window.scrollTo(0, 0);
						window.location.hash = "page="+now_dom;
						
						re_z.push(n);
						}else{
							l=l>1?l:l+1;
							if(n===re_z[l - 2]){
								set_banna();
								}
							}
					}
               
                
            } else {
				if(now_dom===re_z[0]){SetRen();return;}
				temp_n2=now_dom;
				temp_n=re_z[l - 2];
				setTimeout(function(){
					warpDom.removeClass('transition-none');
					banna_z[temp_n2].a.removeClass("now-show show-banna");
					banna_z[temp_n].a.addClass("show-banna now-show");
					},17);
				
				
				now_dom=re_z[l - 2];
                window.scrollTo(0, banna_z[re_z[l - 2]].b);
				window.location.hash = "page="+now_dom;
                if (l > 1) {
					re_z.pop();
                }
            } 
            page_n = now_dom;
			SetRen();
			
			

        }
        return set_banna;
    }
	function SetRen(){
		var f=init.PageFuc[page_n];
		if(f){
			if(!f.ks){
				init.MyGet(f.url,function(d){
				if(f.id){
					d='<div id="'+f.id.slice(1)+'">'+d+'</div>';
					}
			    f.dom.html(d);
				if(f.key){
					init.temlp[f.key]=d;
					}
				$(".fixed-warp").css("height", document.documentElement.clientHeight);
				if(f.fuc){
					f.fuc();
					}
					});
				init.PageFuc[page_n]=false;
				}else{
					f.warpId.html('<div id="'+f.id.slice(1)+'">'+f.data+'</div>');
					if(f.fuc){
						f.fuc();
						}
					$(".fixed-warp").css("height", document.documentElement.clientHeight);
					init.PageFuc[page_n]=false;
					}
			
			
			}
		
		}

    //页面大小改变，动态修正字体大小。
    $(window).resize(function(){
		document.documentElement.style.fontSize=(document.documentElement.clientWidth*100/(375*2))+'px';
		});
    init.GoPage = new router_div("#data-warp");
	var ms={cc:function(){init.PopupFuc.cc(init);},cf:function(){init.PopupFuc.cf(init);}};
	init.TipString=init.V('#vue-bom-warp',{tip:'网络错误',selecTip:'你确定要 吗？',dom:false},ms);
	$(".body-data").css("min-height", document.documentElement.clientHeight);
	//自动得到登录信息
	if(localStorage.sysUserInfo&&localStorage.sysUserInfo!==''){
		init.LoginInfo=JSON.parse(localStorage.sysUserInfo);
		}else{
			console.log('未登录');
			}
	

})();


	//Vue.filter('addk',function(a){return a+"@";});
	//$event   event.currentTarget  event.target
	
	//vm.$nextTick
	
	//watch:{'ff':{handler:function(val){console.log(val);}}
	/*
	v-show
    v-model="aa"
    v-for="(d,n) in data"  //d是值， n是key
    v-if=""
    v-on:click=    缩写@click
    v-bind:src=    缩写:src
	
	循环都是  值 索引
	事件 
.stop
.prevent
.capture
.self
.once

常用写法
	'use strict';
	var T = new AllFunc();
	var vId='#vue-select';
	var pageId='#page-select';
	var url='';
	var refOption={nameKey:'selectData',id:pageId,fucKey:'goSelect',dataKey:'data',data:{title:false,data:false,result:false}};
	T.Ref(refOption);
	T.Load(url,pageId,callFuc,vId);
	function callFuc(){
		var allData={pageShow:false};
		var ms={};
		var vm=T.V(vId,allData,ms,{userInput:ms.wh});//new Vue
		T.N(vm,function(){vm.pageShow=true;});//页面显示
		T.Ref(refOption,ref);
		ref();
		function ref(){
			
			}
		}


*/