(function () {
    'use strict';
    var T = new AllFunc();

    T.Load('./parts/index/BusinessDataTemp.html', "#dt4", function () {

        var api = [
            //收入
            "api/query_in_come_by_item.json",
            //支出
            "api/query_pay_by_item.json"
        ];
        var b = 'commonParams' in T.AllData;
        if (!b) {
            return;
        }
        var CP = T.AllData.commonParams;
        if (!CP.unitId) {
            return;
        }
        var unitId = CP.unitId,
            //本月 1   本年  2
            monthYear = CP.monthYear,
            //收入--》1     支出--》2
            stateFlag = CP.stateFlag,
            itemId2 = CP.itemId2,
            itemName = CP.itemName,
            arr = CP.arr.concat([]);

        var vm = new Vue({
            el: '#business_data_temp',
            data: {
                api: api[stateFlag - 1],
                unitId: unitId,
                itemName: '',
                //本月 1   本年  2
                monthYear: monthYear,
                itemId2: itemId2,
                //收入--》1    支出--》2
                stateFlag: stateFlag,
                //头部面包屑
                arr: arr.concat([]),
                itemList: [
                    //last   true代表没有子级了
                    // {"itemId":12,"itemName":"科目1","target":12,"reach":2,"reachRate":20,"last":true},
                ]
            },
            computed: {
                listTitle: function () {
                    return {
                        "monthYear": this.monthYear === 1 ? "本月" : "本年",
                        "title": this.stateFlag === 1 ? {"name": "收入科目", "target": "目标", "reach": "达成", "reachRate": "使用率"} : {"name": "支出科目", "target": "总额", "reach": "冻结及使用", "reachRate": "使用率"}
                    };
                }
            },
            methods: {
                goBack: function () {
                    window.history.go(-1);
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
                    var data = {
                        "unitId": _this.unitId,
                        "itemId": _this.itemId2,
                        "type": _this.monthYear
                    };
                    T.MyPost(_this.api, function (res) {
                        if (res.isSuccess) {
                            _this.itemList = [];
                            if (!res.data.itemList || !res.data.itemList.length) {
                                return;
                            }
                            res.data.itemList.forEach(function (item, index) {
                                _this.itemList[index] = {
                                    "itemId": item.itemId,
                                    "itemName": item.itemName,
                                    "target": item.target % 1 === 0 ? item.target : _this.formatFn(item.target.toFixed(2)),
                                    "reach": item.reach % 1 === 0 ? item.reach : _this.formatFn(item.reach.toFixed(2)),
                                    "reachRate": item.reachRate % 1 === 0 ? item.reachRate : _this.formatFn(item.reachRate.toFixed(1)),
                                    "last": item.last
                                };
                            });
                        } else {
                            T.Tip("网络错误");
                        }
                    }, data);
                },
                //列表点击更换数据
                tabStore: function (itemId, name, last) {
                    if (last) {
                        return;
                    }
                    this.itemId2 = itemId;
                    this.arr.push(name);
                },
                active: function () {
                    // var _this=this;
                    var oBox = document.getElementById('top_title');
                    this.$nextTick(function () {
                        var oItem = oBox.children;
                        var len = oItem.length;
                        var w = 0;
                        for (var i = 0; i < len; i++) {
                            w += oItem[i].offsetWidth;
                        }
                        oBox.style.width = w / 100 * 2.5 + 'rem';
                    });
                }
            },
            created: function () {
                this.getData();
            },
            mounted: function () {
                this.active();
                // var _this=this;
            },
            watch: {
                itemId2: function () {
                    this.getData();
                },
                monthYear: function () {
                    this.getData();
                },
                arr: function () {
                    this.active();
                },
                itemName: function (val) {
                    this.arr.push(this.stateFlag === 1 ? '收入科目' : '支出科目');
                    this.arr.push(val.split('/')[0]);
                    this.active();
                }
            }
        });

        function this_ref () {
            var dataName;
            if (T.AllData.BusinessData.dataName !== undefined) {
                dataName = T.AllData.BusinessData.dataName;
                vm.arr = dataName.arr;
                vm.unitId = dataName.unitId;
                vm.itemId2 = dataName.itemId2;
                vm.monthYear = dataName.monthYear;
                vm.stateFlag = dataName.stateFlag;
                vm.itemName = dataName.itemName;
            }
        }

        T.Ref(refOption, this_ref);
        this_ref();
    });
    var refOption = {
        nameKey: 'BusinessData',
        id: '#dt4',
        fucKey: 'ref',
        dataKey: 'dataName',
        data: {
            arr: [],
            unitId: '',
            itemId2: '',
            monthYear: '',
            stateFlag: ''
        }
    };
    T.Ref(refOption);

})();
