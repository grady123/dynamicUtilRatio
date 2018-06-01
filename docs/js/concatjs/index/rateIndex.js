(function () {

    'use strict';
    //该工具现有转场,ajax自动loading,加载器功能，及提示方法下面是示例
    var T = new AllFunc();
    T.Load('./parts/index/rateIndex.html', "#dt", function () {
        var params = T.AllData.commonParams;
        //默认头部传递组织名字数组
        var arr = [];

        //console.log(params)

        function goPage (id) {
            var my_index = $(id).index();

            function go () {
                var n;
                T.Hostory.forEach(function (item, index) {
                    if (item === my_index) {
                        n = index;
                    }
                });
                for (var i = 0, len = T.Hostory.length - (n + 1); i < len; i++) {
                    T.GoPage(false, 'right');
                }
            }

            if (my_index in T.Hostory) {
                go();
            } else {
                T.GoPage(id, 'right');
            }
        }

        var rateIndex = new Vue({
            //
            el: '#rateIndex',
            data: {
                nn: 0,
                height: 0,
                //组织ID:
                'unitId': params.unitId,
                //组织name:
                name: params.name,
                //账期
                accountPeriod: params.accountPeriod,
                //childrenListFlag:
                childrenListFlag: T.AllData.commonParams.childrenListFlag,
                one: false,
                three: false,
                isHide: true,
                topNavData: ['经营利润', '收入', '支出'],
                bottomBtnData: {
                    "text": "展开全部",
                    "iconClass": "向下图标",
                    "bSign": true,
                    "len": 12
                },
                myTopNavIndex: 0,
                //本月1，本年2
                monthYear: params.monthYear,
                //分月1,累计2
                monthTotal: params.monthTotal,
                //底部 组织，时间标识 bottomFlag 0 组织 ，1，时间，2业务
                bottomFlag: params.bottomFlag,
                //头部数据
                target: '',
                reach: '',
                reachRate1: '',
                reachRate2: '',
                //组织--本月,本年
                orgName: [],
                unitList: '',
                num: 35,//表格X轴底部高度
                //nhCharts:''
                //图表柱子，折线数据-//组织
                seriesDataOrg: [
                    {
                        name: '目标',
                        type: 'bar',
                        barGap: '-100%',
                        data: [],
//					            barWidth:10,
                        barCategoryGap: '50%',
                        itemStyle: {
                            normal: {
                                color: 'rgb(203,234,254)',
                                barBorderRadius: [3, 3, 3, 3]//圆角
                            }

                        }

                    },
                    {
                        name: '达成',
                        type: 'bar',
                        data: [],
                        barCategoryGap: '50%',
                        itemStyle: {
                            normal: {
                                color: 'rgba(109,197,110,0.4)',
                                barBorderRadius: [3, 3, 3, 3]
                            }
                        }
                    },
                    {
                        name: '达成率',
                        type: 'scatter',
                        symbol: "circle",
//					            symbolSize:5,
                        data: [],
                        yAxisIndex: 1,
                        itemStyle: {
                            normal: {
                                color: '#ff723a'
                            }
                        }
                    }
                ],
                //时间
                seriesDataTime: [
                    {
                        name: '收入',
                        type: 'bar',
                        barGap: '-100%',
                        data: [],
                        barCategoryGap: '50%',
                        itemStyle: {
                            normal: {
                                color: 'rgb(203,234,254)',
                                barBorderRadius: [3, 3, 3, 3]//圆角
                            }

                        }

                    },
                    {
                        name: '支出',
                        type: 'bar',
                        data: [],
                        barCategoryGap: '50%',
                        itemStyle: {
                            normal: {
                                color: 'rgba(109,197,110,0.4)',
                                barBorderRadius: [3, 3, 3, 3],
                                //opacity:0.4
                            }
                        }
                    },
                    {
                        name: '经营利润',
                        type: 'bar',
                        data: [],
                        itemStyle: {
                            normal: {
                                color: '#ff723a'
                            }
                        }
                    },
                    {
                        name: '经营利润率',
                        type: 'line',
                        symbol: "circle",
//				symbolSize:5,
                        data: [],
                        yAxisIndex: 1,
                        itemStyle: {
                            normal: {
                                color: 'pink'
                            }
                        }
                    }
                ],
                legendDataOrg: [
                    {"name": "目标", "icon": "rect"},
                    {"name": "达成", "icon": "rect"},
                    {"name": "达成率", "icon": "rect"}
                ],
                legendDataTime: [
                    {"name": "收入", "icon": "rect"},
                    {"name": "支出", "icon": "rect"},
                    {"name": "经营利润", "icon": "rect"},
                    {"name": "经营利润率", "icon": "rect"}
                ],
                //默认排序 1倒序 2升序
                rateOrder: 1,
                userId: ''
            },

            computed: {
                selShow: function () {
                    return {
                        "icon-iconfontunfold": this.isHide,
                        "icon-iconfonunfold": !this.isHide
                    }
                }

            },
            // 在 `methods` 对象中定义方法
            methods: {
                change: function () {
                    this.isHide = !this.isHide;
                },
                closeWindow: function (event) {
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
                        T.Tip('请输入有效数字');
                        return false;
                    }
                },
                selChange: function () {
                    var that = this,
                        //我是整个根组织名称
                        name = params.projectName;
                    var callBack = function (d) {
                        //d是回调函数带过来的数据
                        //console.log(d);
                        params.unitId = d.id;
                        params.name = d.name;
                        params.pid = d.pid;
                        params.childrenListFlag = (d.orgUnitLevel > 3) ? true : false;
                        params.bottomFlag = (d.orgUnitLevel > 3) ? 3 : 0;
                        arr = d.groupList;

                        rateIndex.unitId = d.id;
                        rateIndex.name = d.name;
                        rateIndex.pid = d.pid;
                        rateIndex.childrenListFlag = (d.orgUnitLevel > 3) ? true : false;
                        rateIndex.bottomFlag = (d.orgUnitLevel > 3) ? 3 : 0;

                        if (params.childrenListFlag == false) {
                            if (params.bottomFlag == 0) {
                                that.getData(params.monthYear);
                            } else if (params.bottomFlag == 1) {
                                that.getTimeData(params.monthTotal);
                            } else if (params.bottomFlag == 2) {
                                params.monthTotal = 1;
                                rateIndex.monthTotal = 1;
                                that.getTimeData(1);
                            } else if (params.bottomFlag == 3) {
                                that.getData(params.monthYear);

                            }

                        }
                        //为项目节点
                        else {
                            if (params.bottomFlag == 3) {
                                params.monthTotal = 1;
                                rateIndex.monthTotal = 1;
                                that.getTimeData(1);
                            } else if (params.bottomFlag == 2) {
                                params.bottomFlag == 3;
                                rateIndex.bottomFlag == 3;
                                params.monthTotal = 1;
                                rateIndex.monthTotal = 1;
                                that.getTimeData(1);
                            } else if (params.bottomFlag == 1) {
                                params.bottomFlag == 3;
                                rateIndex.bottomFlag == 3;
                                params.monthTotal = 1;
                                rateIndex.monthTotal = 1;
                                that.getTimeData(params.monthTotal);
                            }
                        }

                    }
                    /**
                     * 项目选择
                     * T.AllData.selectUnit(userId,projectName,callBack) 全局调用
                     * @method
                     * @param  {[num,str,obj]}  [用户id,用语默认被选选项的项目名字,回调]
                     * @return {[type,id,name,pid]}   [0为父系1为子系,项目id,项目名称,项目父系id]
                     */
                    T.AllData.selectUnit(rateIndex.userId, name, callBack);
                },
                //返回上一个历史记录
                goBack: function () {
                    window.history.go(-1);
                },
                //本月,本年点击切换数据
                tabStore: function (index) {
                    params.monthYear = index;
                    rateIndex.monthYear = index;
                },
                //分月，累计
                tabStore2: function (index) {
                    params.monthTotal = index;
                    rateIndex.monthTotal = index;
                },
                //底部组织，时间点击切换数据
                buttonTab: function (flag) {
                    params.bottomFlag = flag;
                    rateIndex.bottomFlag = flag;
                },
                //底部按钮点击展开和收缩列表事件
                accordion: function () {
                    if (this.bottomBtnData.bSign) {
                        this.bottomBtnData.text = '收起列表';
                        this.bottomBtnData.bSign = false;
                        this.bottomBtnData.len = rateIndex.unitList.length;
                    } else {
                        this.bottomBtnData.text = '展开列表';
                        this.bottomBtnData.bSign = true;
                        this.bottomBtnData.len = 12;
                    }
                },
                //头部导航点击更新数据
                topNavUpDate: function (index, ev) {

                },
                //图表
                echarts: function () {
                    var that = this;
                    var nhCharts = echarts.init(document.getElementById('nhCharts2'));
                    //左边组织目标  右边时间收入
                    var maxReachLeft = '';
                    var minReachLeft = '';

                    //左边组织达成  右边时间支出
                    var maxTargetLeft = '';
                    var minTargetLeft = '';

                    //时间利润率
                    var maxReachLeft2, minReachLeft2;

                    //组织左边--达成率，时间--动态利润率
                    var maxReachRight = '';
                    var minReachRight = '';

                    var leftArrMax = [];
                    var leftArrMin = [];
                    var maxNumLeft;
                    var minNumLeft;
                    if (!rateIndex.unitList || !rateIndex.unitList.length) {
                        maxNumLeft = 0;
                        minNumLeft = 0;
                        maxReachRight = 0;
                        minReachRight = 0;

                    } else {
                        if (rateIndex.bottomFlag === 0) {
                            //组织--目标
                            maxReachLeft = rateIndex.seriesDataOrg[0].data.concat([]).sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataOrg[0].data.length - 1];
                            leftArrMax.push(maxReachLeft);
                            minReachLeft = rateIndex.seriesDataOrg[0].data.concat([]).sort(function (a, b) {
                                return a - b;
                            })[0];
                            leftArrMin.push(minReachLeft);

                            //组织--达成
                            maxTargetLeft = rateIndex.seriesDataOrg[1].data.concat().sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataOrg[1].data.length - 1];
                            leftArrMax.push(maxTargetLeft);

                            minTargetLeft = rateIndex.seriesDataOrg[1].data.concat().sort(function (a, b) {
                                return a - b;
                            })[0];
                            leftArrMin.push(minTargetLeft);

                            //组织--达成率
                            maxReachRight = rateIndex.seriesDataOrg[2].data.concat().sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataOrg[2].data.length - 1];
                            minReachRight = rateIndex.seriesDataOrg[2].data.concat().sort(function (a, b) {
                                return a - b;
                            })[0];
                        } else if (rateIndex.bottomFlag === 1 || rateIndex.bottomFlag === 3) {
                            //时间--收入
                            maxReachLeft = rateIndex.seriesDataTime[0].data.concat([]).sort(function (a, b) {
                                return a - b
                            })[rateIndex.seriesDataTime[0].data.length - 1];
                            leftArrMax.push(maxReachLeft);
                            minReachLeft = rateIndex.seriesDataTime[0].data.concat([]).sort(function (a, b) {
                                return a - b
                            })[0];
                            leftArrMin.push(minReachLeft);

                            //时间--支出
                            maxTargetLeft = rateIndex.seriesDataTime[1].data.concat().sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataTime[1].data.length - 1];
                            leftArrMax.push(maxTargetLeft);

                            minTargetLeft = rateIndex.seriesDataTime[1].data.concat([]).sort(function (a, b) {
                                return a - b;
                            })[0];
                            leftArrMin.push(minTargetLeft);

                            //时间--利润率
                            maxReachLeft2 = rateIndex.seriesDataTime[2].data.concat().sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataTime[2].data.length - 1];
                            leftArrMax.push(maxReachLeft2);

                            minReachLeft2 = rateIndex.seriesDataTime[2].data.concat([]).sort(function (a, b) {
                                return a - b;
                            })[0];
                            leftArrMin.push(minReachLeft2);

                            //时间--动态利润率
                            maxReachRight = rateIndex.seriesDataTime[3].data.concat().sort(function (a, b) {
                                return a - b;
                            })[rateIndex.seriesDataTime[3].data.length - 1];
                            minReachRight = rateIndex.seriesDataTime[3].data.concat().sort(function (a, b) {
                                return a - b;
                            })[0];
                        }

                        maxNumLeft = leftArrMax.sort(function (a, b) {
                            return a - b;
                        })[leftArrMax.length - 1];
                        minNumLeft = leftArrMin.sort(function (a, b) {
                            return a - b;
                        })[0];

                    }

                    var maxNumRight = maxReachRight;
                    var minNumRight = minReachRight;
                    var option = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            itemWidth: 28,
                            itemHeight: 12,
                            itemGap: 20,
                            //data:rateIndex.legendDataOrg,
                            data: params.bottomFlag === 0 ? rateIndex.legendDataOrg : rateIndex.legendDataTime
                        },
                        textStyle: {
                            color: '#9fa3ac'
                        },
                        dataZoom: [
                            {
                                type: this.bottomFlag === 1 || this.bottomFlag === 3 || rateIndex.unitList.length <= 12 ? 'inside' : 'slider',
                                zoomLock: true,
                                startValue: 0,
                                endValue: rateIndex.orgName.length < 12 ? rateIndex.orgName.length - 1 : 11,
                                height: '8px',
                                showDetail: false,
                                bottom: 0,
                                handleStyle: {
                                    color: 'rgba(209,209,209.1)'
                                },
                                backgroundColor: 'rgba(238,238,238,1)'
                            },
                            {
                                type: 'inside'
                            }
                        ],
                        xAxis: [
                            {
                                type: 'category',
                                data: rateIndex.orgName,//
                                axisLabel: {//显示所有刻度
                                    interval: 0,
                                    formatter: function (val) {//字符串换行
                                        if (!val) return;
                                        var str = '';
                                        if (that.bottomFlag === 0) {
                                            str = val.split('').join('\n');
                                        } else {
                                            //  str=val.substring(0,val.length-1)+'\n'+val.charAt(val.length-1);
                                            str = val.replace(/\D/g, function (res) {
                                                var tmp = '';
                                                tmp = '\n' + res;
                                                return tmp;
                                            });
                                        }

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
                                        color: '#008ACD',
                                        width: '10px'
                                    }
                                }
                            }
                        ],
                        grid: { // 控制图的大小，调整下面这些值就可以，
                            left: 55,
                            right: 55,
                            bottom: this.num// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
                        },
                        yAxis: [
                            {
                                type: 'value',
                                axisTick: false,
                                min: minNumLeft < 0 ? Math.ceil(minNumLeft) : 0,//minNumLeft,
                                // interval: 50,
                                minInterval: 1,
                                max: maxNumLeft < 100 ? 100 : Math.ceil(maxNumLeft),
                                axisLine: {
                                    lineStyle: {
                                        color: '#008ACD'
                                    }
                                },
                                axisLabel: {
                                    formatter: function (val, index) {
                                        var text = '';
                                        if (index === 0) {
                                            text = '万元';
                                        } else {
                                            text = val;
                                        }
                                        return text;
                                    },
                                    textStyle: {
                                        color: '#777E8C'
                                    }
                                },
                                splitLine: {
                                    show: true
                                }
                            },
                            {
                                type: 'value',
                                axisTick: false,
                                min: (rateIndex.bottomFlag === 0) ? minNumRight < 0 ? Math.ceil(minNumRight) : 0 : minNumRight < 0 ? Math.ceil(minNumRight) : 0,//minNumRight,
                                max: (rateIndex.bottomFlag === 0) ? maxNumRight < 100 ? 100 : Math.ceil(maxNumRight) : maxNumRight < 100 ? 100 : Math.ceil(maxNumRight),//
                                // interval: 50,
                                minInterval: 1,
                                boundaryGap: true,
                                nameTextStyle: {
                                    color: '#777E8C'
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: '#008ACD'
                                    }
                                },
                                axisLabel: {
                                    formatter: function (val, index) {
                                        var text = '';
                                        if (index === 0) {
                                            text = '%';
                                        } else {
                                            text = val;
                                        }
                                        return text;
                                    },
                                    textStyle: {
                                        color: '#777E8C'
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        type: 'dotted'
                                    }
                                }

                            }
                        ],
                        //series :rateIndex.seriesDataOrg
                        series: rateIndex.bottomFlag === 0 ? rateIndex.seriesDataOrg : rateIndex.seriesDataTime
                    };
                    nhCharts.clear();
                    nhCharts.setOption(option, true);
                    nhCharts.resize();
                },

                xaxisDataChange: function (val) {
                    var n = 2;
                    for (var i = 0; i < val.length; i++) {
                        for (var k = 0; k < val[i].length; k++) {
                            if (n < k) {
                                n = k;
                            }
                        }
                    }
                    //默认是6rem的高度     跟据文字的多少来改变高度
                    document.getElementById('nhCharts2').style.height = 6 + (n * 18 / 100) + 'rem';
                    //默认this.num是35   出现两个文字
                    this.num = 35 + n * 12;
                    this.echarts();
                },
                getData: function (type) {
                    var that = this;
                    T.LdShow();
                    T.MyPost('api/query_profit_by_unit.json', function (res) {
                        T.LdHide();
                        var data = res.data;
                        if (res.status === 0) {
                            //图表数据
                            rateIndex.unitList = data.unitList;
                            //每次组织数据置空
                            rateIndex.orgName = [];
                            rateIndex.seriesDataOrg[0].data = [];
                            rateIndex.seriesDataOrg[1].data = [];
                            rateIndex.seriesDataOrg[2].data = [];
                            if (!data.unitList || !data.unitList.length) {
                                return false;
                            }
                            $(data.unitList).each(function (index, item) {
                                rateIndex.orgName.push(item.unitName);
                                rateIndex.seriesDataOrg[0].data.push(that.getDecimal(item.target, 2));
                                rateIndex.seriesDataOrg[1].data.push(that.getDecimal(item.reach, 2));
                                rateIndex.seriesDataOrg[2].data.push(that.getDecimal(item.reachRate, 1));
                            });

                            that.echarts();
                        } else {
                            T.Tip();
                        }
                        //params.unitId
                    }, {'unitId': params.unitId, 'type': type, 'rateOrder': params.rateOrder === undefined ? 1 : params.rateOrder, userId: params.userId}, true);
                },
                //获取时间维度数据
                getTimeData: function (type) {
                    var that = this;
                    T.MyPost('api/query_profit_by_time.json', function (res) {
                        var data = res.data;
                        if (res.status === 0) {
                            //图表数据
                            rateIndex.unitList = data.timeList;
                            //每次组织数据置空
                            rateIndex.orgName = [];
                            rateIndex.seriesDataTime[0].data = [];
                            rateIndex.seriesDataTime[1].data = [];
                            rateIndex.seriesDataTime[2].data = [];
                            rateIndex.seriesDataTime[3].data = [];
                            if (!rateIndex.unitList || !rateIndex.unitList.length) {
                                return false;
                            }
                            $(data.timeList).each(function (index, item) {
                                rateIndex.orgName.push(item.month);
                                rateIndex.seriesDataTime[0].data.push(that.getDecimal(item.income, 2));
                                rateIndex.seriesDataTime[1].data.push(that.getDecimal(item.pay, 2));
                                rateIndex.seriesDataTime[2].data.push(that.getDecimal(item.income - item.pay, 2));
                                rateIndex.seriesDataTime[3].data.push(that.getDecimal(item.reachRate, 1));
                            });
                            that.echarts();
                        } else {
                            T.Tip();
                        }
                    }, {'unitId': params.unitId, 'type': type});
                },
                //获取当月组织数据
                getProfitData: function () {
                    T.MyPost('api/query_profit.json', function (res) {
                        var data = res.data;

                        //处理达成率小数
                        var reachRate, reachRate2, reachRatePointer, reachRatePointer2;

                        if (res.status === 0) {

                            reachRate = res.data.reachRate;
                            if (Math.abs(reachRate) >= 0 && Math.abs(reachRate) < 0.05) {
                                reachRate2 = 0;
                                reachRatePointer2 = '';
                            } else if (reachRate % 1 === 0) {
                                reachRate2 = reachRate;
                                reachRatePointer2 = '.0';
                            } else {
                                reachRate2 = parseInt(reachRate.toString().split('.')[0]);
                                reachRatePointer = reachRate.toString().split('.')[1].substring(0, 2);
                                if (parseFloat(reachRatePointer) >= 95 && parseFloat(reachRatePointer) <= 99) {
                                    reachRate2 = reachRate2 + 1;
                                    reachRatePointer2 = '.0';
                                } else {
                                    reachRatePointer2 = '.' + reachRate.toFixed(1).split('.')[1];
                                }
                            }

                            rateIndex.target = data.target % 1 === 0 ? data.target : res.data.target.toFixed(2);
                            //当月收入达成
                            rateIndex.reach = data.reach % 1 === 0 ? data.reach : res.data.reach.toFixed(2);
                            //当月收入达成率
                            rateIndex.reachRate1 = reachRate2;
                            rateIndex.reachRate2 = reachRatePointer2;
                        } else {
                            T.Tip();
                        }
                    }, {unitId: params.unitId}, true);
                },
                orgNext: function (item) {
                    console.log(item);
                    params.unitId = item.unitId;
                    params.name = item.unitName;
                    rateIndex.unitId = item.unitId;
                    rateIndex.name = item.unitName;
                    arr.push(item.unitName);
                    if (item.level > 3) {
                        rateIndex.bottomFlag = 3;
                        rateIndex.childrenListFlag = true;

                        params.bottomFlag = 3;
                        params.childrenListFlag = true;
                        this.getTimeData(1);
                    } else {
                        rateIndex.childrenListFlag = false;
                        params.childrenListFlag = false;
                        this.getData(params.monthYear);
                    }

                },
                //跳到收入里面
                goInCome: function () {
                    var _this = this;
                    T.direction = 'right';
                    //console.log(T.AllData.InCome);
                    T.AllData.InCome.ref({
                        arr: arr.concat([]),
                        unitId: rateIndex.unitId,
                        name: rateIndex.name,
                        childrenListFlag: rateIndex.childrenListFlag,
                        monthYear: rateIndex.monthYear,
                        monthTotal: rateIndex.monthTotal,
                        bottomFlag: rateIndex.bottomFlag
                    });
                    T.AllData.selectUnitstatus = false;
                    goPage('#dt1');
                },
                getDecimal: function (val, type) {
                    if (!isNaN(val)) {
                        if (val % 1 === 0) {
                            return val
                        }
                        else {
                            if (Math.abs(val.toFixed(type)) === 0) {
                                return Math.abs(val).toFixed(type);
                            }
                            return val.toFixed(type);
                        }
                    } else {
                        T.Tip('返回数据类型错误');
                    }
                },
                //跳到支出里面
                goPay: function () {
                    T.direction = 'right';
                    T.AllData.Pay.ref({
                        arr: arr.concat([]),
                        unitId: rateIndex.unitId,
                        name: rateIndex.name,
                        childrenListFlag: rateIndex.childrenListFlag,
                        monthYear: rateIndex.monthYear,
                        monthTotal: rateIndex.monthTotal,
                        bottomFlag: rateIndex.bottomFlag
                    }, function () {
                        //console.log('支出页数据已经传递出去');
                    });

                    goPage('#dt2');
                },
                rateOrderFunc: function (rateOrder) {
                    if (!rateIndex.unitList || !rateIndex.unitList.length || rateIndex.unitList.length == 1) {
                        return false;
                    } else {
                        rateIndex.rateOrder = rateOrder == 1 ? 2 : 1;
                        params.rateOrder = rateOrder == 1 ? 2 : 1;
                    }

                }
            },
            created: function () {
                this.getProfitData();
                if (params.childrenListFlag === false) {
                    if (params.bottomFlag === 0) {
                        this.getData(params.monthYear);
                    } else if (params.bottomFlag === 1) {
                        this.getTimeData(params.monthTotal);
                    } else if (params.bottomFlag === 2) {
                        params.monthTotal = 1;
                        rateIndex.monthTotal = 1;
                        this.getTimeData(1);
                    }

                }
                else {

                    if (params.bottomFlag === 3) {
                        //console.log(params.monthTotal);
                        this.getTimeData(params.monthTotal);
                    } else if (params.bottomFlag === 2) {
                        this.getTimeData(params.monthTotal);
                    }
                }
            },
            mounted: function () {
                /*this.goGroup();
                 this.goBusiness();*/
            },
            watch: {
                monthYear: function () {
                    if (params.childrenListFlag) {
                        rateIndex.getTimeData(rateIndex.monthTotal);
                    } else {
                        rateIndex.getData(rateIndex.monthYear);
                    }

                    //console.log('本月本年'+rateIndex.monthYear);
                },
                monthTotal: function () {
                    rateIndex.getTimeData(rateIndex.monthTotal);
                    //.log('分月，累计'+rateIndex.monthTotal);
                },
                orgName: function () {
                    this.xaxisDataChange(rateIndex.orgName);
                },
                accountPeriod: function () {
                },
                seriesDataOrg: function () {
                    //console.log(val);
                },
                unitId: function () {
                    this.getProfitData();
                    //console.log('组织id变化'+rateIndex.unitId+rateIndex.childrenListFlag);
                    if (rateIndex.childrenListFlag) {
                        rateIndex.getTimeData(rateIndex.monthTotal);
                    } else {
                        rateIndex.getData(rateIndex.monthYear);

                    }
                },
                /*name:function(){
                 console.log('组织名称变化');
                 },*/
                bottomFlag: function () {
                    //console.log('组织底部变化'+rateIndex.bottomFlag);
                    if (rateIndex.bottomFlag == 0) {
                        rateIndex.getData(params.monthYear);
                    } else {
                        rateIndex.getTimeData(params.monthTotal);
                    }
                },
                bottomBtnData: function () {
                    //console.log('啥子呀!!!!');
                },
                childrenListFlag: function (val) {
                    //console.log('项目'+val);
                },
                rateOrder: function (newVal, oldVal) {
                    //console.log(oldVal+'watch');
                    this.getData(params.monthYear);
                },
                legendDataOrg: function () {
                    //console.log('组织上面3个按钮');

                },
                legendDataTime: function () {
                    //console.log('时间上面4个按钮');
                },
            },
            filters: {
                'decimalFiter': function (val, type) {
                    if (!isNaN(val)) {
                        if (val % 1 === 0) {
                            return val;
                        }
                        else {
                            if (type == 1) {
                                return val.toFixed(type);
                            } else {
                                return val.toFixed(type);
                            }

                        }
                    } else {
                        T.Tip('返回数据类型错误');
                    }
                }
            },
        });

        function this_ref () {
            //console.log(T.AllData.rateIndexName.dataName);
            if (T.AllData.rateIndexName.dataName !== undefined) {
                var dataName = T.AllData.rateIndexName.dataName;
                //console.log(dataName);
                arr = dataName.arr;
                rateIndex.unitId = dataName.unitId;
                rateIndex.name = dataName.name;
                rateIndex.childrenListFlag = dataName.childrenListFlag;
                rateIndex.monthYear = dataName.monthYear;
                rateIndex.monthTotal = dataName.monthTotal;
                rateIndex.bottomFlag = dataName.bottomFlag;
                rateIndex.userId = dataName.userId;
                rateIndex.rateOrder = 1;

                params.unitId = dataName.unitId;
                params.name = dataName.name;
                params.childrenListFlag = dataName.childrenListFlag;
                params.monthYear = dataName.monthYear;
                params.monthTotal = dataName.monthTotal;
                params.bottomFlag = dataName.bottomFlag;
                params.userId = dataName.userId;
                params.rateOrder = 1;
            }
        }

        T.Ref(refOption, this_ref);
        this_ref();

    });
    var refOption = {
        nameKey: 'rateIndexName',
        id: '#dt',
        fucKey: 'ref',
        dataKey: 'dataName',
        data: {
            arr: [],
            unitId: '',
            name: '',
            childrenListFlag: '',
            monthYear: '',
            monthTotal: '',
            bottomFlag: '',
            rateOrder: '',
        }
    };
    T.Ref(refOption);

})();
	