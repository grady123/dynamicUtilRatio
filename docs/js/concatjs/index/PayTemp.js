(function () {
    'use strict';
    var T = new AllFunc();

    T.Load('./parts/index/PayTemp.html', "#dt2", function () {
        var b = 'commonParams' in T.AllData;
        if (!b) {
            return;
        }
        var CP = T.AllData.commonParams;
        if (!CP.unitId) {
            return;
        }

        var unitId = CP.unitId,
            name = CP.name,
            accountPeriod = CP.accountPeriod,
            userId = CP.userId,
            childrenListFlag = CP.childrenListFlag,
            monthYear = CP.monthYear,
            monthTotal = CP.monthTotal,
            bottomFlag = CP.bottomFlag;
        var arr = Array;
        var api = [
            //支入按组织
            'api/query_pay_by_unit.json',
            //支入按时间
            'api/query_pay_by_time.json',
            //支入按业务
            'api/query_pay_by_item.json',
            //支入按当月组织
            'api/query_pay.json',
            //获取itemId
            'api/query_item_by_pid.json'
        ];

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

        //获取itemId
        var p1 = new Promise(function (resolve, reject) {
            T.MyGet('api/query_item_by_pid.json', function (res) {
                if (res.isSuccess) {
                    resolve(res.data[0].id);
                }
            }, {"property": 2}, true);
        });

        p1.then(function (itemId) {
            var vm = new Vue({
                el: '#pay_temp',
                data: {
                    api: api[bottomFlag === 3 ? 2 : bottomFlag],
                    //组织ID:
                    unitId: unitId,
                    //组织name:
                    name: name,
                    //用户id
                    userId: userId,
                    //收入按当月数据
                    sameMonthData: {
                        //账期
                        accountPeriod: '',
                        //当月收入达成
                        reach: '',
                        //当月收入达成率
                        reachRate: '',
                        "reachRatePointer": '',
                        //当月收入目标
                        target: ''
                    },
                    //掉用了getData函数的次数   多次掉用时只有第一次有效
                    count: 0,
                    bRate: true,
                    itemId: itemId,
                    //childrenListFlag: 组织是否还有下级  true/false
                    childrenListFlag: childrenListFlag,
                    //本月 1   本年  2
                    monthYear: monthYear || 1,
                    //分月  1   累计  2
                    monthTotal: monthTotal || 1,
                    //bottomNav索引
                    bottomFlag: bottomFlag === 3 ? 2 : bottomFlag,
                    //表格X轴底部高度
                    num: 35,
                    //图表X轴数据
                    xaxisData: [],
                    //echarts目标
                    target: [],
                    //echarts达成
                    reach: [],
                    //echarts达成率
                    reachRate: [],
                    //1:desc 倒序,2: asc升序 )
                    rateOrder: 1,
                    //列表数据
                    inComeList: [//组织单元级别（1集团2区域公司3公司4管理项目5部门6工作组）
                        // {"name":"新城首府","target":10,"reach":5.2,"reachRate":"36%","level":,"last":true/false},
                    ],
                    //列表下面点击按钮
                    bottomBtnData: {
                        "text": "展开全部",
                        "bSign": true,
                        "len": 12
                    }
                },
                computed: {
                    //列表样式样式  跟据  组织，时间，业务
                    inComeListState: function () {
                        var json = {};
                        switch (this.bottomFlag) {
                            case 0://组织
                                json = {
                                    "titleData": ['组织', '总额', '冻结及已用', '使用率'],
                                    //组织页5栏  时间及业务页4栏  状态   及达成率图标的状态
                                    "bHide": true,
                                    "arr": ['本月', '本年'],
                                    //字体是否有蓝色字体状态
                                    "c_3395FF": true
                                };
                                break;
                            case 1://时间
                                json = {
                                    "titleData": ['月份', '总额', '冻结及已用', '使用率'],
                                    "bHide": false,
                                    "arr": ['分月', '累计'],
                                    "c_3395FF": false
                                };
                                break;
                            case 2://业务
                                json = {
                                    titleData: ['支出科目', '总额', '冻结及已用', '使用率'],
                                    "bHide": false,
                                    "arr": ['本月', '本年'],
                                    "c_3395FF": true
                                };
                                break;
                        }
                        return json;
                    },
                    myIndex: function () {
                        var index;
                        if (this.bottomFlag === 1) {
                            index = this.monthTotal - 1;
                        } else {
                            index = this.monthYear - 1;
                        }
                        return index;
                    }
                },
                methods: {
                    //返回上一个历史记录
                    goBack: function () {
                        // T.GoPage();
                        window.history.go(-1);
                    },
                    selChange: function () {
                        var _this = this;
                        var userId = this.userId,
                            //我是整个根组织名称
                            name = CP.projectName,
                            callBack = function (d) {
                                _this.unitId = d.id;
                                _this.name = d.name;
                                _this.pid = d.pid;
                                arr = d.groupList.concat([]);
                                if (d.orgUnitLevel > 3) {
                                    _this.childrenListFlag = true;
                                    _this.api = api[2];
                                    _this.bottomFlag = 2;
                                } else {
                                    _this.childrenListFlag = false;

                                }

                            };
                        /**
                         * 项目选择
                         * T.AllData.selectUnit(userId,projectName,callBack) 全局调用
                         * @method
                         * @param  {[num,str,obj]}  [用户id,用语默认被选选项的项目名字,回调]
                         * @return {[type,id,name,pid]}   [0为父系1为子系,项目id,项目名称,项目父系id]
                         */
                        T.AllData.selectUnit(userId, name, callBack);
                    },
                    //公共状态
                    store: function () {
                        CP.bottomFlag = this.bottomFlag;
                        CP.monthYear = this.monthYear;
                        CP.monthTotal = this.monthTotal;
                        CP.name = this.name;
                        CP.unitId = this.unitId;
                        CP.itemId = this.itemId;
                        CP.childrenListFlag = this.childrenListFlag;
                        //收入--》0     支出--》1
                        CP.stateFlag = 2;

                    },
                    //跳到经营利润里面
                    goTateIndex: function () {
                        this.store();
                        var _this = this;
                        T.direction = 'right';
                        T.AllData.rateIndexName.ref({
                            arr: arr.concat([]),
                            unitId: _this.unitId,
                            name: _this.name,
                            childrenListFlag: _this.childrenListFlag,
                            monthYear: _this.monthYear,
                            monthTotal: _this.monthTotal,
                            bottomFlag: _this.childrenListFlag ? 3 : _this.bottomFlag === 2 ? 0 : _this.bottomFlag
                        });
                        T.AllData.selectUnitstatus = false;
                        goPage('#dt');
                    },
                    //跳到收入里面
                    goInCome: function () {
                        this.store();
                        //跳转页面前掉用
                        var _this = this;
                        T.direction = 'right';
                        T.AllData.InCome.ref({
                            arr: arr.concat([]),
                            unitId: _this.unitId,
                            name: _this.name,
                            childrenListFlag: _this.childrenListFlag,
                            monthYear: _this.monthYear,
                            monthTotal: _this.monthTotal,
                            bottomFlag: _this.bottomFlag
                        });
                        T.AllData.selectUnitstatus = false;
                        goPage('#dt1');
                    },
                    //本月本年点击切换数据
                    tabStore: function (index) {
                        this.count = 0;
                        if (this.bottomFlag === 0 || this.bottomFlag === 2) {
                            //本月 1   本年  2
                            this.monthYear = index + 1;
                        } else {
                            //分月  1   累计  2
                            this.monthTotal = index + 1;
                        }
                        this.bottomBtnData = {
                            "text": "展开全部",
                            "bSign": true,
                            "len": 12
                        };
                    },
                    //图表
                    echarts: function () {
                        var _this = this;
                        var nhCharts = echarts.init(document.getElementById('pay_nhCharts'));

                        // this.target=[22,32,42,520,100];
                        // this.reach=[12,22,72,242,52];
                        // this.reachRate=[12,22,-32,42,52];

                        var maxTarget, maxReach, maxReachRate, minTarget, minReach, minReachRate, y1_min, y1_max, y2_min, y2_max, maxNum, minNum;
                        if (!this.reachRate || !this.reachRate.length) {
                            maxTarget = 0;
                            maxReach = 0;
                            maxReachRate = 0;

                            minTarget = 0;
                            minReach = 0;
                            minReachRate = 0;

                            y1_min = 0;
                            y1_max = 100;
                            y2_min = 0;
                            y2_max = 100;
                        } else {
                            maxReachRate = parseFloat(this.reachRate.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[this.reachRate.length - 1]);
                            maxReach = parseFloat(this.reach.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[this.reach.length - 1]);
                            maxTarget = parseFloat(this.target.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[this.target.length - 1]);

                            minReachRate = parseFloat(this.reachRate.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[0]);
                            minReach = parseFloat(this.reach.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[0]);
                            minTarget = parseFloat(this.target.concat([]).sort(function (n1, n2) {
                                return n1 - n2;
                            })[0]);

                            maxNum = maxReach > maxTarget ? maxReach : maxTarget;
                            minNum = minReach < minTarget ? minReach : minTarget;

                            y1_min = minNum >= 0 ? 0 : Math.ceil(minNum);
                            y1_max = maxNum < 100 ? 100 : Math.ceil(maxNum);

                            y2_min = minReachRate >= 0 ? 0 : Math.ceil(minReachRate);
                            y2_max = maxReachRate <= 100 ? 100 : Math.ceil(maxReachRate);

                        }
                        var option = {
                            tooltip: {
                                //show:false,//取消提示框
                                trigger: 'axis',
                                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                }
                            },
                            dataZoom: [
                                {
                                    type: this.bottomFlag === 1 || this.inComeList.length <= 12 ? 'inside' : 'slider',
                                    zoomLock: true,
                                    startValue: 0,
                                    endValue: this.inComeList.length < 12 ? this.inComeList.length - 1 : 11,
                                    height: '8px',
                                    showDetail: false,
                                    bottom: 0,
                                    handleStyle: {
                                        color: 'rgba(209,209,209,1)'
                                    },
                                    backgroundColor: 'rgba(238,238,238,1)'
                                },
                                {
                                    type: 'inside'
                                }
                            ],
                            legend: {
                                itemWidth: 22,
                                itemHeight: 12,
                                itemGap: 20,
                                //selectedMode:false,//不可点击
                                data: [
                                    {"name": "总额", "icon": "rect"},
                                    {"name": "冻结及已用", "icon": "rect"},
                                    {"name": "使用率", "icon": "rect"}
                                ]
                            },
                            textStyle: {
                                color: '#9fa3ac'
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: this.xaxisData,
                                    axisLabel: {//显示所有刻度
                                        interval: 0,
                                        formatter: function (val) {//字符串换行
                                            if (!val) return;
                                            var str = '';
                                            if (_this.bottomFlag !== 1) {
                                                str = val.split('').join('\n');
                                            } else {
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
                                    axisLine: {
                                        lineStyle: {
                                            color: '#008ACD'
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
                                    min: y1_min,
                                    max: y1_max,
                                    minInterval: 1,
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
                                    }
                                },
                                {
                                    type: 'value',
                                    axisTick: false,
                                    min: y2_min,
                                    max: y2_max,
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
                                        lineStyle: {
                                            type: 'dotted'
                                        }
                                    }
                                }
                            ],
                            series: [
                                {
                                    name: '总额',
                                    type: 'bar',
                                    barGap: '-100%',
                                    data: this.target,
//					            barWidth:10,
                                    barCategoryGap: '50%',
                                    itemStyle: {
                                        normal: {
                                            color: '#cbeafe',
                                            barBorderRadius: [3, 3, 3, 3]//圆角
                                        }
                                    }
                                },
                                {
                                    name: '冻结及已用',
                                    type: 'bar',
                                    data: this.reach,
                                    barCategoryGap: '50%',
                                    itemStyle: {
                                        normal: {
                                            color: 'rgba(109,197,110,0.4)',
                                            barBorderRadius: [3, 3, 3, 3]
                                        }
                                    }
                                },
                                {
                                    name: '使用率',
                                    type: this.bottomFlag === 1 ? 'line' : 'scatter',
                                    symbol: "circle",
                                    data: this.reachRate,
                                    yAxisIndex: 1,
                                    itemStyle: {
                                        normal: {
                                            color: '#ff723a'
                                        }
                                    }
                                }
                            ]
                        };
                        nhCharts.clear();
                        nhCharts.setOption(option, true);
                        nhCharts.resize();
                    },
                    //动态改变数据走势图的高度
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
                        document.getElementById('pay_nhCharts-box').style.height = 6 + (n * 18 / 100) + 'rem';
                        //默认this.num是35   出现两个文字
                        // this.num=35+n*12;
                        this.num = 35 + n * 12;
                        this.echarts();
                    },
                    //底部按钮点击展开和收缩列表事件
                    accordion: function () {
                        if (this.inComeList.length > 12) {
                            if (this.bottomBtnData.bSign) {
                                this.bottomBtnData.text = '收起列表';
                                this.bottomBtnData.bSign = false;
                                this.bottomBtnData.len = this.inComeList.length;
                            } else {
                                this.bottomBtnData.text = '展开列表';
                                this.bottomBtnData.bSign = true;
                                this.bottomBtnData.len = 12;
                            }
                        }
                    },
                    //列表点击切换   id
                    tabIdStore: function (id, itemId, name, last, level) {
                        this.count = 0;
                        var _this = this;
                        if (this.bottomFlag === 0) {
                            arr.push(name);
                            //组织项返回数据没有itemId
                            this.name = name;
                            this.unitId = id;

                            if (level > 3) {
                                _this.childrenListFlag = true;
                                _this.api = api[2];
                                _this.bottomFlag = 2;
                            }
                        } else if (this.bottomFlag === 2) {
                            //如果是业务页点击就跳到  业务数据页
                            this.store();
                            T.direction = 'right';
                            //业务项返回数据没有unitId
                            CP.itemId2 = itemId;
                            T.AllData.BusinessData.ref({
                                arr: arr.concat([]),
                                unitId: _this.unitId,
                                itemId2: itemId,
                                monthYear: _this.monthYear,
                                stateFlag: 2,
                                itemName: name + '/' + Math.random()
                            });
                            T.AllData.selectUnitstatus = false;
                            goPage('#dt4');
                            return;
                        }
                    },
                    //组织页列表   达成率点击排序
                    rate_order: function (index) {
                        if (this.bottomFlag === 0) {
                            if (index === 3) {
                                if (!this.inComeList || !this.inComeList.length || this.inComeList.length === 1) {
                                    return;
                                }
                                this.rateOrder === 1 ? this.rateOrder = 2 : this.rateOrder = 1;
                            }
                        }
                    },
                    //获取当月组织数据
                    getSameMonthData: function () {
                        var _this = this;
                        T.MyGet(api[3], function (res) {
                            //处理达成率小数
                            var reachRate, reachRate2, reachRatePointer, reachRatePointer2;

                            if (res.isSuccess) {

                                if (res.data) {
                                    reachRate = res.data.reachRate;
                                    if (Math.abs(reachRate) >= 0 && Math.abs(reachRate) < 0.05) {
                                        reachRate2 = 0;
                                        reachRatePointer2 = '';
                                        _this.bRate = false;
                                    } else if (reachRate % 1 === 0) {
                                        reachRate2 = reachRate;
                                        reachRatePointer2 = '.0';
                                        _this.bRate = true;
                                    } else {
                                        reachRate2 = parseInt(reachRate.toString().split('.')[0]);
                                        reachRatePointer = reachRate.toString().split('.')[1].substring(0, 2);
                                        if (parseFloat(reachRatePointer) >= 95 && parseFloat(reachRatePointer) <= 99) {
                                            reachRate2 = reachRate2 + 1;
                                            reachRatePointer2 = '.0';
                                        } else {
                                            reachRatePointer2 = '.' + reachRate.toFixed(1).split('.')[1];
                                        }
                                        _this.bRate = true;
                                    }
                                    _this.sameMonthData = {
                                        //账期
                                        "accountPeriod": res.data.accountPeriod,
                                        //当月收入目标
                                        "target": res.data.target % 1 === 0 ? res.data.target : _this.formatFn(res.data.target.toFixed(2)),
                                        //当月收入达成
                                        "reach": res.data.reach % 1 === 0 ? res.data.reach : _this.formatFn(res.data.reach.toFixed(2)),
                                        //当月收入达成率
                                        "reachRate": reachRate2,
                                        "reachRatePointer": reachRatePointer2
                                    };
                                }

                            } else {
                                T.Tip("网络错误");
                                console.log(res);
                            }
                        }, {"unitId": _this.unitId}, true);
                    },
                    formatFn: function (num, n) {
                        var s = n || 1;
                        var res = '';
                        if (Math.abs(num) === 0) {
                            res = Math.abs(num).toFixed(s);
                            return res;
                        }
                        return num;
                    },
                    getData: function () {
                        var _this = this;
                        //返回后台的数据
                        var data = {};
                        if (_this.bottomFlag === 0) {
                            //组织页数据格式
                            data = {
                                "unitId": _this.unitId,
                                "userId": _this.userId,
                                "type": _this.monthYear,
                                "rateOrder": _this.rateOrder
                            };
                        } else if (_this.bottomFlag === 1) {
                            //时间页数据格式
                            data = {
                                "unitId": _this.unitId,
                                "type": _this.monthTotal
                            };
                        } else if (_this.bottomFlag === 2) {
                            //业务页数据格式
                            data = {
                                "unitId": _this.unitId,
                                "itemId": _this.itemId,
                                "type": _this.monthYear
                            };
                        }
                        T.LdShow();
                        T.MyGet(_this.api, function (res) {
                            T.LdHide();
                            _this.count = 0;
                            if (res.isSuccess) {
                                _this.inComeList = [];
                                //图表X轴数据
                                _this.xaxisData = [];
                                //echarts目标
                                _this.target = [];
                                //echarts达成
                                _this.reach = [];
                                //echarts达成率
                                _this.reachRate = [];
                                switch (_this.bottomFlag) {
                                    case 0:
                                        if (res.data.unitList && res.data.unitList.length) {
                                            res.data.unitList.forEach(function (item, index) {
                                                _this.inComeList[index] = {
                                                    "name": item.unitName,
                                                    "target": item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)),
                                                    "reach": item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)),
                                                    "reachRate": item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)),
                                                    "id": item.unitId,
                                                    "last": item.last,
                                                    "level": item.level
                                                };
                                                //图表X轴数据
                                                _this.xaxisData.push(item.unitName);
                                                //echarts目标
                                                _this.target.push(item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)));
                                                //echarts达成
                                                _this.reach.push(item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)));
                                                //echarts达成率
                                                _this.reachRate.push(item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)));
                                            });
                                        }

                                        break;
                                    case 1:
                                        if (res.data.timeList && res.data.timeList.length) {
                                            res.data.timeList.forEach(function (item, index) {
                                                _this.inComeList[index] = {
                                                    "name": item.month,
                                                    "target": item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)),
                                                    "reach": item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)),
                                                    "reachRate": item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1))
                                                };
                                                //图表X轴数据
                                                _this.xaxisData.push(item.month);
                                                //echarts目标
                                                _this.target.push(item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)));
                                                //echarts达成
                                                _this.reach.push(item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)));
                                                //echarts达成率
                                                _this.reachRate.push(item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)));
                                            });
                                        } else {
                                            console.log('支出时间页出错了');
                                        }

                                        break;
                                    case 2:
                                        if (res.data.itemList && res.data.itemList.length) {
                                            res.data.itemList.forEach(function (item, index) {
                                                _this.inComeList[index] = {
                                                    "name": item.itemName,
                                                    "target": item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)),
                                                    "reach": item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)),
                                                    "reachRate": item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)),
                                                    "itemId": item.itemId,
                                                    "last": item.last
                                                };
                                                //图表X轴数据
                                                _this.xaxisData.push(item.itemName);
                                                //echarts目标
                                                _this.target.push(item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)));
                                                //echarts达成
                                                _this.reach.push(item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)));
                                                //echarts达成率
                                                _this.reachRate.push(item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)));
                                            });
                                        } else {
                                            console.log('支出业务页出错了');
                                        }
                                        break;
                                }
                            } else {
                                T.Tip("网络错误");
                            }
                        }, data, true);
                    },
                    //底部导航状态切换
                    tabNavStore: function (index) {
                        this.count = 0;
                        this.bottomFlag = index;
                        this.api = api[index];
                        this.bottomBtnData = {
                            "text": "展开全部",
                            "bSign": true,
                            "len": 12
                        };

                    }
                },
                created: function () {
                    this.getData();
                    this.getSameMonthData();
                },
                mounted: function () {

                },
                watch: {
                    xaxisData: function (val) {
                        this.xaxisDataChange(val);
                    },
                    api: function () {
                        // console.log('pay-----------ip');
                        this.count++;
                        if (this.count === 1) {
                            this.getData();
                        }

                    },
                    monthYear: function () {
                        // console.log('pay-----------年月');
                        this.count++;
                        if (this.count === 1) {
                            this.getData();
                        }
                    },
                    monthTotal: function () {
                        // console.log('pay-----------分月累计');
                        this.count++;
                        if (this.count === 1) {
                            this.getData();
                        }
                    },
                    unitId: function () {
                        // console.log('pay-----------unitId');
                        this.count++;
                        this.getSameMonthData();
                        if (this.count === 1) {
                            this.getData();
                        }

                        // //只在组织和时间页加载
                        // if(this.bottomFlag !== 2){
                        // }

                    },
                    rateOrder: function () {
                        this.getData();
                    }
                }
            });

            function this_ref () {
                var dataName;
                if (T.AllData.Pay.dataName !== undefined) {
                    dataName = T.AllData.Pay.dataName;
                    arr = dataName.arr;
                    vm.api = api[dataName.bottomFlag === 3 ? 2 : dataName.bottomFlag];
                    vm.unitId = dataName.unitId;
                    vm.name = dataName.name;
                    vm.childrenListFlag = dataName.childrenListFlag;
                    vm.monthYear = dataName.monthYear;
                    vm.monthTotal = dataName.monthTotal;
                    vm.bottomFlag = dataName.bottomFlag === 3 ? 2 : dataName.bottomFlag;
                }
            }

            T.Ref(refOption, this_ref);
            this_ref();
        });

    });
    var refOption = {
        nameKey: 'Pay',
        id: '#dt2',
        fucKey: 'ref',
        dataKey: 'dataName',
        data: {
            arr: [],
            unitId: '',
            name: '',
            childrenListFlag: '',
            monthYear: '',
            monthTotal: '',
            bottomFlag: ''
        }
    };
    T.Ref(refOption);
})();
