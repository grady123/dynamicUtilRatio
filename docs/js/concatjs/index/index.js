(function () {
    'use strict';
    var ID = {userId: '6605'};
    var T = new AllFunc();
    // var vId='#vue-moblieApproval-list';
    // var pageId='#page-list';
    // var url='./parts/index/list.html';
    //自动登录 ---------------------
    //得到url上search对像
    var useObj = T.GetSearch();
    //判断是url是否带有登录信息，如有，走登录流程
    if (useObj.loginNo) {
        T.MyGet('/nets-platform-uum-api/api/user/login', function (d) {
            localStorage.removeItem("sysUserInfo");
            if (d.status === 0) {
                localStorage.setItem('sysUserInfo', JSON.stringify(d.data));
                T.LoginInfo = d.data;
                if (T.LoginInfo.userId) {
                    ID.userId = T.LoginInfo.userId;
                    main();
                    T.GoPage();
                } else {
                    T.Tip('获取用户ID失败');
                }
            } else {
                T.Tip('登录失败,' + d.message + '！！');
            }
        }, useObj);
    } else {
        //判断是否是否开发环境
        if (location.href.indexOf('jkl4561213') < 0) {
            //不在开发环境且没有url登录字段，直接取登录信息
            if (T.LoginInfo.userId) {
                ID.userId = T.LoginInfo.userId;
            } else {
                // window.location.href = '/';
            }
        }
        main();
    }

    //自动登录 end---------------------------------
    function main () {
        T.Load('./parts/index/index.html', "#my_index", function () {
            var userId = ID.userId;
            if (userId === undefined || userId === '') {
                window.location.href = '/';
            }
            var arr = [];
            //暴露出去参数
            var params = {
                //组织ID
                'unitId': '',
                //组织名称
                'name': '',
                //用户ID
                userId: userId,
                //当前组织判断是否为项目  true 为项目, 反之为false       根据（level来判断的 --组织单元级别（1集团2区域公司3公司4管理项目5部门6工作组））
                childrenListFlag: '',

                //默认本月1   本年2
                monthYear: 1,
                //默认分月1 累计2
                monthTotal: 1,
                //底部3大状态  默认组织 0  时间1  业务2 无状态3
                bottomFlag: 0,

                //维度3大状态  默认动态利用率 0  收入 1  支出2

                stateFlag: 0,
                //账期
                accountPeriod: '',
                arr: [],
                //组织选择树 根节点名字
                projectName: '',
            };
            //共同传的参数
            T.AllData.commonParams = params;

            var ms = {
                //返回上一个历史记录
                goBack: function () {
                    // T.GoPage();
                    window.history.go(-1);
                },
                //走势折线图
                echarts: function () {
                    var that = this;
                    var nhCharts = echarts.init(document.getElementById('my_echarts'));
                    var maxY = indexVue.seriesDataY.concat([]).sort(function (a, b) {
                        return b - a;
                    })[0];
                    var widthLeft = 45;
                    if (maxY > 1000000) {
                        widthLeft = 85;
                    } else {
                        if (maxY > 10000) {
                            widthLeft = 70;
                        } else {
                            widthLeft = 45;
                        }
                    }
                    var option = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        textStyle: {
                            color: '#9fa3ac'
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: indexVue.seriesDataX,
                                axisLabel: {//显示所有刻度
                                    interval: 0,
                                    formatter: function (val) {//字符串换行
                                        var str = '';
                                        str = val.replace(/\D/g, function (res) {
                                            var tmp = '';
                                            tmp = '\n' + res;
                                            return tmp;
                                        });
                                        return str;
                                    }
                                },
                                axisTick: {
                                    alignWithLabel: true,
                                    lineStyle: {
                                        color: '#000'
                                    }
                                },
                                splitLine: {
//									lineStyle:{
//										color:'#000'
//									}
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: '#cacaca',
                                        width: '10px',
                                    }
                                }
                            }
                        ],
                        grid: { // 控制图的大小，调整下面这些值就可以，
                            left: widthLeft,
                            right: 40,
                            top: 10,
                            bottom: 45
                        },
                        yAxis: [
                            {
                                type: 'value',
                                axisTick: false,
                                minInterval: 1,
                                axisLine: {
                                    lineStyle: {
                                        color: '#cacaca'
                                    }
                                },
                                boundaryGap: [0, '10%'],
                                axisLabel: {
                                    formatter: function (val, index) {
                                        var text = ''
                                        text = val + '%';
                                        return text;
                                    },
                                    textStyle: {
                                        color: '#777E8C'
                                    }
                                }
                            }
                        ],
                        series: [
                            {

                                type: 'line',
                                symbol: "circle",
                                data: indexVue.seriesDataY,
                                itemStyle: {
                                    normal: {
                                        color: '#6dc56e'
                                    }
                                }
                            }
                        ]
                    };
                    nhCharts.clear;
                    nhCharts.setOption(option, true);
                },
                //跳转到组织页面
                goOrgIndex: function () {
                    // T.GoPage(1);
                },
                //获取组织数据
                getOrgId: function () {
                    var that = this;
                    // T.MyPost('/nets-platform-uum-api/api/user/get_org_list_permission', function (res) {
                    T.MyGet('api/org_tree_data_query_auth.json', function (res) {
                        if (res.status == 0) {
                            var data = res.data[0];
                            //应该默认进来有个根组织ID name
                            data.orgUnitLevel=2;
                            indexVue.unitId = data.id;
                            indexVue.name = data.orgUnitName;
                            indexVue.childrenListFlag = data.orgUnitLevel > 3 ? true : false;
                            indexVue.bottomFlag = params.childrenListFlag ? 3 : 0;

                            params.unitId = data.id;
                            params.name = data.orgUnitName;
                            params.childrenListFlag = data.orgUnitLevel > 3 ? true : false;
                            params.bottomFlag = params.childrenListFlag ? 3 : 0;
                            arr = [];
                            arr.push(data.orgUnitName);
                        } else {
                            T.Tip();
                        }
                    }, {userId: userId})
                },
                //获取1-2位小数
                getDecimal: function (val, type) {
                    if (!isNaN(val)) {
                        if (val % 1 === 0) {
                            return val.toFixed(1);
                        }
                        else {
                            return val.toFixed(type);
                        }

                    } else {
                        T.Tip('返回数据类型错误');
                    }
                },
                //获取主页数据
                getData: function () {
                    var that = this;
                    console.log(2222);
                    T.MyGet('api/query_dynamic_profit_rate.json', function (res) {
                        console.log(res);
                        if (res.status == 0) {
                            var data = res.data;
                            indexVue.unitId = data.unitId;
                            indexVue.accountPeriod = data.accountPeriod;
                            params.accountPeriod = data.accountPeriod;
                            indexVue.profitRate = that.getDecimal(data.profitRate, 1) === 0 ? 0 : that.getDecimal(data.profitRate, 1).toString().split('.')[0];
                            indexVue.profitRatePointer = data.profitRate == 0 ? '' : '.' + that.getDecimal(data.profitRate, 1).toString().split('.')[1];
                            indexVue.target = that.getDecimal(data.target, 2);
                            indexVue.reach = that.getDecimal(data.reach, 2);
                            var arrY = [];
                            var arrX = [];
                            $.each(data.trendList, function (index, val) {
                                arrY.push(val.profitRate.toFixed(1));
                                arrX.push(val.month);
                            });
                            indexVue.seriesDataY = arrY;
                            indexVue.seriesDataX = arrX;
                            indexVue.reachRate = that.getDecimal(data.reachRate, 1);
                            indexVue.income = that.getDecimal(data.income, 2);
                            indexVue.incomeIndex = that.getDecimal(data.incomeIndex, 2);
                            indexVue.pay = that.getDecimal(data.pay, 2);
                            indexVue.payIndex = that.getDecimal(data.payIndex, 2);
                            //收入
                            var str = that.ratio(indexVue.income, indexVue.incomeIndex);
                            var width1Rate = str * 5.76;
                            $('.this-year-count .income').css('width', width1Rate + 'rem');
                            //支出
                            var str2 = that.ratio(indexVue.pay, indexVue.payIndex);
                            var width2Rate = str2 * 5.76;
                            $('.this-year-count .pay').css('width', width2Rate + 'rem');
                            indexVue.$nextTick(function () {
                                that.echarts();
                            })

                        } else {
                            T.Tip(res.message);
                        }
                    }, {'unitId': indexVue.unitId, userId: userId})
                },
                ratio: function (a, b) {
                    if (!isNaN(a) && !isNaN(b)) {
                        if (b != 0) {
                            var c = a / b;
                            var d = c.toFixed(2);
                            return d;
                        } else {
                            return 0;
                        }

                    } else {
                        T.Tip('返回数字有误!');
                        return false;
                    }

                },
                selChange: function () {
                    var that = this,
                        //我是整个根组织名称
                        callBack = function (d) {
                            //d是回调函数带过来的数据
                            params.unitId = d.id;
                            params.name = d.name;
                            params.pid = d.pid;
                            arr = [];
                            arr = d.groupList;
                            //console.log(d);
                            params.childrenListFlag = (d.orgUnitLevel > 3) ? true : false;
                            params.bottomFlag = params.childrenListFlag ? 3 : 0;

                            indexVue.unitId = d.id;
                            indexVue.name = d.name;
                            indexVue.pid = d.pid;
                            indexVue.childrenListFlag = (d.orgUnitLevel > 3) ? true : false;
                            indexVue.bottomFlag = indexVue.childrenListFlag ? 3 : 0;
                            that.getData();

                        }

                    /**
                     * 项目选择
                     * T.AllData.selectUnit(userId,projectName,callBack) 全局调用
                     * @method
                     * @param  {[num,str,obj]}  [用户id,用语默认被选选项的项目名字,回调]
                     * @return {[type,id,name,pid]}   [0为父系1为子系,项目id,项目名称,项目父系id]
                     */
                    T.AllData.selectUnit(indexVue.userId, params.name, callBack);
                },
                show: function () {
                    var _this = this;
                    var oSlide = document.getElementById('index_slide');
                    var screenH = document.documentElement.clientHeight;
                    oSlide.addEventListener('touchstart', function (ev) {
                        //屏幕总高度
                        var oTouchStart = ev.targetTouches[0];
                        //按下时坐标
                        var touchY = oTouchStart.pageY;

                        function fnEnd (ev) {
                            var oTouchEnd = ev.changedTouches[0];
                            //如果移动的距离大于  100  的时候就跳转页面
                            if (touchY - oTouchEnd.pageY > 100) {
                                //console.log(params.childrenListFlag);
                                T.AllData.rateIndexName.ref({
                                    arr: arr.concat([]),
                                    unitId: _this.unitId,
                                    name: _this.name,
                                    childrenListFlag: _this.childrenListFlag,
                                    monthYear: 1,
                                    monthTotal: 1,
                                    bottomFlag: _this.childrenListFlag ? 3 : 0,
                                    userId: _this.userId,
                                    projectName: _this.projectName
                                }, function () {
                                    //console.log(T.AllData.rateIndexName);
                                    //console.log('经营利润页数据已经传递出去');
                                });
                                //跳转到默认动态利用率界面非最后节点页面
                                T.AllData.selectUnitstatus = false;
                                T.GoPage('#dt', 'up');
                            }
                            document.removeEventListener('touchend', fnEnd, false);
                        }

                        //限制按下的距离在底部 100 以内
                        if (screenH - oTouchStart.pageY < 100) {

                            document.addEventListener('touchend', fnEnd, false);
                        }
                        ev.preventDefault && ev.preventDefault();
                    }, false);
                }
            }

            var indexVue = {
                el: '#box',
                data: {
                    //组织ID:
                    'unitId': '',
                    //组织name:
                    'name': '',
                    //账期
                    'accountPeriod': '',
                    //动态利润率
                    'profitRate': "",
                    //动态利润率 小数点
                    profitRatePointer: '',
                    //本月目标
                    'target': '',
                    //本月达成
                    'reach': '',
                    //本月达成率
                    'reachRate': '',
                    //动态经营利润率走势--图表X轴数据
                    xaxisData: [],
                    //图表Y轴数据
                    seriesDataY: [],
                    seriesDataX: [],
                    //本年收入(实际)
                    income: '',
                    //本年收入指标(预算)
                    incomeIndex: '',
                    //本年支出(实际)
                    pay: '',
                    //本年支出指标(预算)
                    payIndex: '',
                    userId: params.userId,

                },
                created: function () {
                    //默认获取组织
                    this.getOrgId();
                },
                methods: ms,
                mounted: function () {
                    this.show();
                },
                nextTick: function () {
                    //console.log('我是DOM加载完之后的呀');
                },
                watch: {
                    'unitId': function (newVal) {
                        this.getData();
                    },
                    'name': function (newVal) {
                        //this.name =newVal;
                    },
                    childrenListFlag: function () {
                        //console.log('底部变化');
                    },
                    projectName: function (val) {
                        //console.log(val);
                    }

                }
            };
            indexVue = new Vue(indexVue);

        });
    }
})();

	