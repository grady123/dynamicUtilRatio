(function () {
    'use strict';
    var T = new AllFunc();
    var all_data = {};
    T.AllData.selectUnitstatus = false
    T.AllData.selectUnit = function (Id, nowName, callBack) {
        all_data.userId = Id;
        all_data.nowProject = nowName;
        // T.MyGet('/nets-platform-uum-api/api/user/get_user_project_tree', getData, {
        // T.MyGet('/nets-budget/api/org/org_tree_data_query_auth', getData, { // 这个以后还要改回来的
        T.MyGet('api/org_tree_data_query_all.json', getData, {
            userId: all_data.userId
        });

        function getData (d) {
            var a = setPidData(d.data);
            var v = {
                childrenList: a,
                etsId: '',
                id: '',
                orgNodePath: '',
                orgUnitLevel: '',
                orgUnitName: '组织',
                pid: '',
                typeProp: ''
            };
            console.log(a);
            all_data.data = v;
            all_data.navGroup = [];//记录位置 对应数据
            all_data.navGroupName = []; //位置库中对应公司的名字
            all_data.nameList = []; //列表里显示的名字
            if (typeof all_data.data == 'undefined') {
                T.Tip('组织数据为空！');
                return;
            }
            all_data.navGroup.push(all_data.data); //root库
            all_data.keys = "";
            for (var i = 0; i < all_data.navGroup.length; i++) {
                all_data.navGroupName.push({name: all_data.navGroup[i].orgUnitName})
            }
            for (var i = 0; i < all_data.navGroup[all_data.navGroup.length - 1].childrenList.length; i++) {
                all_data.nameList.push({name: all_data.navGroup[all_data.navGroup.length - 1].childrenList[i].orgUnitName, max: all_data.navGroup[all_data.navGroup.length - 1].childrenList[i].childrenList.length})
            } // 循环装入倒数第一级的childrenlist 中的选项
            if (T.AllData.selectUnitstatus === false) {
                T.Load('./parts/index/projectSelect.html', "#projectSelect", function () {
                    var projectSelect = new Vue({
                        el: "#selBody",
                        data: all_data,
                        methods: {
                            getProject: function (index) {
                                var _Arr = {};
                                _Arr.id = all_data.navGroup[all_data.navGroup.length - 1].childrenList[index].id,
                                    _Arr.name = all_data.navGroup[all_data.navGroup.length - 1].childrenList[index].orgUnitName,
                                    _Arr.pid = all_data.navGroup[all_data.navGroup.length - 1].childrenList[index].pid
                                _Arr.orgUnitLevel = all_data.navGroup[all_data.navGroup.length - 1].childrenList[index].orgUnitLevel
                                var _temp = [];
                                for (var i = 0; i < all_data.navGroup.length; i++) {
                                    _temp.push(all_data.navGroup[i].orgUnitName)
                                }
                                ;
                                _temp.push(_Arr.name)
                                _Arr.groupList = _temp;
                                callBack(_Arr)
                                T.GoPage();
                            },
                            groupAdd: function (i) {
                                all_data.navGroupName.push(all_data.nameList[i])
                                all_data.nameList = [] //清空
                                all_data.navGroup.push(all_data.navGroup[all_data.navGroup.length - 1].childrenList[i]) //增加位置记录
                                for (var a = 0; a < all_data.navGroup[all_data.navGroup.length - 1].childrenList.length; a++) { //读取增加项目的子集
                                    all_data.nameList.push({name: all_data.navGroup[all_data.navGroup.length - 1].childrenList[a].orgUnitName, max: all_data.navGroup[all_data.navGroup.length - 1].childrenList[a].childrenList.length});
                                }
                            },
                            goBack: function () {
                                T.GoPage();
                            },
                            searchShow: function (index) {
                                if (all_data.keys === "" || all_data.nameList[index].name.indexOf(all_data.keys) >= 0) {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            cutList: function (index) {
                                if (all_data.navGroup.length === 1) {
                                    if (all_data.navGroup[all_data.navGroup.length - 1].orgUnitName == '组织') {
                                        return;
                                    }
                                    var _Arr = {};
                                    _Arr.groupList = [];
                                    _Arr.id = all_data.navGroup[all_data.navGroup.length - 1].id;
                                    _Arr.name = all_data.navGroup[all_data.navGroup.length - 1].orgUnitName;
                                    _Arr.pid = all_data.navGroup[all_data.navGroup.length - 1].pid;
                                    _Arr.orgUnitLevel = all_data.navGroup[all_data.navGroup.length - 1].orgUnitLevel;
                                    _Arr.groupList.push(_Arr.name);
                                    callBack(_Arr)
                                    T.GoPage();
                                }
                                all_data.navGroup.length = index + 1;
                                all_data.navGroupName.length = index + 1;
                                all_data.nameList = [] //清空
                                for (var a = 0; a < all_data.navGroup[all_data.navGroup.length - 1].childrenList.length; a++) { //读取增加项目的子集
                                    all_data.nameList.push({name: all_data.navGroup[all_data.navGroup.length - 1].childrenList[a].orgUnitName, max: all_data.navGroup[all_data.navGroup.length - 1].childrenList[a].childrenList.length});
                                }
                            }
                        },
                        created: function shwoPage () {
                            document.getElementById('selBody').style.display = 'block'
                        }
                    });
                    T.AllData.selectUnitstatus = true;
                });
            }
            T.GoPage("#projectSelect", 'right');
        };
    }

    function setPidData (d) {
        for (var a = 0; a < d.length; a++) {
            d[a].childrenList = [];
        }
        var pidList = d;
        var afterList = d;
        cnode(pidList);
        return afterList;

        function cnode (d) {
            var n = afterList.length;
            var newData = null;
            var l = d.length;
            var i = 0;
            for (i = 0; i < l; i++) {
                if (n > 0) {
                    newData = set(d[i].id, afterList);
                    afterList = newData.data;
                    if (newData.nodelist.length > 0) {
                        d[i].childrenList = newData.nodelist;
                        cnode(d[i].childrenList);
                    }
                }
            }
        }

        function set (n, data) {
            n = parseInt(n, 10);
            var t = 0, l = 0, arr1 = [], arr2 = [], i = 0;
            l = data.length;
            for (i = 0; i < l; i++) {
                t = parseInt(data[i].pid, 10);
                if (t === n) {
                    arr1.push(data[i]);
                } else {
                    arr2.push(data[i]);
                }
            }
            return {nodelist: arr1, data: arr2};
        }

    }
})();
