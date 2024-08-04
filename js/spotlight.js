var gitblog = function (config) {
    var self = this;

    self.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }

    self.options = {
        id: null,
        label: null,
        q: null,
        page: 1,
        token: null,
        code: null,
        redirect_url: null,
    }

    self.set = function () {
        if (self.getUrlParam('id') != undefined) {
            self.options.id = parseInt(self.getUrlParam('id'));
        }
        if (self.getUrlParam('label') != undefined) {
            self.options.label = self.getUrlParam('label');
        }
        if (self.getUrlParam('q') != undefined) {
            self.options.q = self.getUrlParam('q');
        }
        if (self.getUrlParam('page') != undefined) {
            self.options.page = parseInt(self.getUrlParam('page'));
        }
        if (self.getUrlParam('access_token') != undefined) {
            self.options.token = self.getUrlParam('access_token');
        }
        if (self.getUrlParam('code') != undefined) {
            self.options.code = self.getUrlParam('code');
        }
        if (self.getUrlParam('state') != undefined) {
            self.options.redirect_url = self.getUrlParam('state');
        }

        if (self.options.code != null && self.options.redirect_url != null) {
            window.location.href = config.server_link + "?code=" + self.options.code + "&redirect_url=" + self.options.redirect_url + "&client_id=" + config.client_id + "&client_secret=" + config.client_secret;
        }
    }

    self.set();

    self.utc2localTime = function (time) {
        var time_string_utc_epoch = Date.parse(time);
        var unixTimestamp = new Date(time_string_utc_epoch);
        var year = unixTimestamp.getFullYear();
        var month = unixTimestamp.getMonth() + 1;
        var date = unixTimestamp.getDate();
        var hour = unixTimestamp.getHours();
        var minute = unixTimestamp.getMinutes();
        var second = unixTimestamp.getSeconds();
        hour = (hour < 10) ? '0' + hour : hour;
        minute = (minute < 10) ? '0' + minute : minute;
        second = (second < 10) ? '0' + second : second;
        return year + '年' + month + '月' + date + '日';
    }

    String.prototype.replaceAll = function (a, b) {
        return this.replace(new RegExp(a, 'gm'), b);
    }

    var Info = function () {
        this.title = config.title;
        this.instruction = config.instruction;
    }

    Info.prototype.init = function () {
        $('#title').text(this.title);
        $('#instruction').text(this.instruction);
        document.getElementsByTagName("title")[0].innerText = this.title;
    }

    var Menu = function () {
        this.labels = [];
    }

    Menu.prototype = {
        searchOnblur: function () {
            if ($('.search-input').val() == "") {
                $(".search-input").css("width", '42px');
                $(".search-input").css("z-index", -1);
            }
        },
        show: function () {
            var menu = this;
            for (var name in config.menu) {
                document.getElementById("menu").innerHTML += '<li><a href=' + config.menu[name] + '><span>' + name + '</span></a></li>';
            }
            if (Object.keys(config.friends).length != 0) {
                var menu_friend = document.getElementById("friends");
                menu_friend.innerHTML = '<li><text style="font-zise:14px"><span style="transform:translateX(4px)">友链：</span></text></li>';
                for (var name in config.friends) {
                    menu_friend.innerHTML += '<li><a href=' + config.friends[name] + ' target="_blank"><span>' + name + '</span></a></li>';
                }
            }
            $(".search-input").on("blur",
                function () {
                    menu.searchOnblur();
                });
        }
    }

    var Icon = function (options, name, left) {
        this.icon_src = options.icon_src;
        this.href = options.href;
        this.hidden_img = options.hidden_img;
        this.width = options.width;
        this.name = name;
        this.position = left;
    }

    Icon.prototype = {
        init: function () {
            var icon = this;
            if (icon.href != undefined && icon.href != null) {
                document.getElementById("div_" + icon.name).innerHTML += '<a target="_blank" title="' + icon.name + '" id="icon_' + icon.name + '" href="' + icon.href + '"><img src="' + icon.icon_src + '" style="width:50px;margin-left:10px;margin-right:10px"></a>';
            } else {
                document.getElementById("div_" + icon.name).innerHTML += '<img src="' + icon.icon_src + '" title="' + icon.name + '" id="icon_' + icon.name + '" style="width:50px;margin-left:10px;margin-right:10px;cursor:pointer">';
            }
            if (icon.hidden_img != undefined && icon.hidden_img != null) {
                document.getElementById("div_" + icon.name).innerHTML += '<img id="' + icon.name + '" src="' + icon.hidden_img + '" style="width: ' + icon.width + 'px; position: absolute; left: calc(50% - ' + this.position + 'px); bottom: 180px; transition: all 0.3s ease 0s; box-shadow: rgb(149, 165, 166) 0px 0px 5px; transform: translateY(-20px); z-index: -1; opacity: 0">';
                $('#icon_' + icon.name).mouseover(function () {
                    icon.changeIcon(icon.name, 'show');
                });
                $('#icon_' + icon.name).mouseout(function () {
                    icon.changeIcon(icon.name, 'hidden');
                });
            }
        },
        changeIcon: function (id, action) {
            if (action == 'show') {
                $('#' + id).css('z-index', '99');
                $('#' + id).css("opacity", "1");
                $('#' + id).css("transform", "translateY(0)");
            } else if (action == 'hidden') {
                $('#' + id).css('z-index', '-1');
                $('#' + id).css("opacity", "0");
                $('#' + id).css("transform", "translateY(-20px)");
            }
        }
    }

    var Footer = function () {
        this.page = new Pages();
        this.icons = [];
        this.icon_num = 0;
        this.content = 'Powered by <a href="https://github.com/chiricosama/blog" target="_blank" ">blog</a>';
    }

    Footer.prototype = {
        showIcon: function () {
            var footer = this;
            for (var i in config.icons) {
                if (config.icons[i].icon_src != undefined && config.icons[i].icon_src != null) {
                    document.getElementById('icon').innerHTML += '<div style="padding-inline-start: 0;margin: 0" id="div_' + i + '"></div>';
                }
            }
            for (var i in config.icons) {
                if (config.icons[i].icon_src != undefined && config.icons[i].icon_src != null) {
                    var left = Object.keys(config.icons).length * 35 - 70 * footer.icon_num + config.icons[i].width / 2 - 35;
                    var icon = new Icon(config.icons[i], i, left);
                    icon.init();
                    footer.icons.push(icon);
                    footer.icon_num++;
                }
            }
        },
        show: function () {
            document.getElementById('footer').innerHTML += this.content;
            this.showIcon();
        }
    }

    var Pages = function () {
        this.page = 1;
        this.pages = 1;
        this.itemNum = 0;
        this.pageLimit = 7;
    }

    Pages.prototype = {
        getNum: function (request_url) {
            var page = this;
            if (self.options.page != null && self.options.page != undefined) {
                page.page = self.options.page;
            }
            $.ajax({
                type: 'get',
                url: request_url,
                success: function (data) {
                    if (self.options.label != null && self.options.label != undefined) {
                        page.itemNum = data.length;
                    } else if (self.options.q != null && self.options.q != undefined) {
                        page.itemNum = data.total_count;
                    } else if (self.options.id != null && self.options.id != undefined) {
                        page.itemNum = data.length;
                        document.getElementById('comments-num').innerHTML = page.itemNum;
                    } else {
                        page.itemNum = data.open_issues_count;
                    }
                    if (page.itemNum > 10) {
                        page.pages = Math.ceil(page.itemNum / 10);
                        page.show();
                    }
                }
            });
        },
        show: function () {
            var page = this;
            $('#pages').css('display', 'inline-block');
            document.getElementById('pages').innerHTML = '<mdui-button class="highlight"><li id="last_page"><a id="last" style="cursor: pointer">«</a></li></mdui-button> ';
            if (page.pages <= page.pageLimit) {
                for (var i = 1; i <= page.pages; i++) {
                    document.getElementById('pages').innerHTML += '<mdui-button class="highlight"><li><a id="page' + i + '" style="cursor:pointer">' + i + '</a></li></mdui-button> ';
                }
            } else {
                if (page.page >= 5) {
                    document.getElementById('pages').innerHTML += '<li><a id="page1" style="cursor:pointer">1</a></li>';
                    document.getElementById('pages').innerHTML += '<li><a style="cursor:pointer;pointer-events: none;">...</a></li>';
                    document.getElementById('pages').innerHTML += '<li><a id="page' + (page.page - 1) + '" v>' + (page.page - 1) + '</a></li>';
                    document.getElementById('pages').innerHTML += '<li><a id="page' + page.page + '" style="cursor:pointer">' + page.page + '</a></li>';
                } else {
                    for (var i = 1; i <= page.page; i++) {
                        document.getElementById('pages').innerHTML += '<li><a id="page' + i + '" style="cursor:pointer">' + i + '</a></li>';
                    }
                }
                if (page.page <= page.pages - 4) {
                    document.getElementById('pages').innerHTML += '<li><a id="page' + (page.page + 1) + '" style="cursor:pointer">' + (page.page + 1) + '</a></li>';
                    document.getElementById('pages').innerHTML += '<li><a style="cursor:pointer;pointer-events: none;">...</a></li>';
                    document.getElementById('pages').innerHTML += '<li><a id="page' + page.pages + '" style="cursor:pointer">' + page.pages + '</a></li>';
                } else {
                    for (var i = page.page + 1; i <= page.pages; i++) {
                        document.getElementById('pages').innerHTML += '<li><a id="page' + i + '" style="cursor:pointer">' + i + '</a></li>';
                    }
                }
            }
            document.getElementById('pages').innerHTML += ' <mdui-button class="highlight"><li id="next_page"><a id="next" style="cursor: pointer;">»</a></li></mdui-button>';
            for (var i = 1; i <= page.pages; i++) {
                if (self.options.label != undefined) {
                    $('#page' + i).click(function () {
                        window.location.href = "?label=" + self.options.label + "&page=" + this.innerHTML;
                    });
                } else if (self.options.id != undefined) {
                    $('#page' + i).click(function () {
                        window.location.href = "?id=" + self.options.id + "&page=" + this.innerHTML;
                    });
                } else if (self.options.q != undefined) {
                    $('#page' + i).click(function () {
                        window.location.href = "?q=" + self.options.q + "&page=" + this.innerHTML;
                    });
                } else {
                    $('#page' + i).click(function () {
                        window.location.href = "?page=" + this.innerHTML;
                    });
                }
                if (i == page.page) {
                    $('#page' + i).addClass('active');
                } else {
                    $('#page' + i).removeClass('active');
                }
            }
            if (page.page == 1) {
                $('#last_page').css('pointer-events', 'none');
                $('#next_page').css('pointer-events', 'auto');
            } else if (page.page == page.pages) {
                $('#last_page').css('pointer-events', 'auto');
                $('#next_page').css('pointer-events', 'none');
            }
            document.getElementById('last').onclick = function () {
                page.last();
            }
            document.getElementById('next').onclick = function () {
                page.next();
            }
        },
        last: function () {
            this.page--;
            if (self.options.label != undefined) {
                window.location.href = '?label=' + self.options.label + '&page=' + this.page;
            } else if (self.options.id != undefined && self.options.id != null) {
                window.location.href = '?id=' + self.options.id + '&page=' + this.page;
            } else {
                window.location.href = '?page=' + this.page;
            }
        },
        next: function () {
            this.page++;
            if (self.options.label != undefined) {
                window.location.href = '?label=' + self.options.label + '&page=' + this.page;
            } else if (self.options.id != undefined && self.options.id != null) {
                window.location.href = '?id=' + self.options.id + '&page=' + this.page;
            } else {
                window.location.href = '?page=' + this.page;
            }
        }
    }

    var Reaction = function () {
        this.num = 0;
        this.isLike = false;
    }

    Reaction.prototype = {
        like: function (type, id) {
            var reaction = this;
            if (reaction.isLike == true) return;
            if (window.localStorage.access_token == undefined || window.localStorage.access_token == null) {
                alert("请先登录！");
                return;
            }
            var request_url = '';
            if (type == 'issue') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + id + '/reactions';
            } else if (type == 'comment') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/comments/' + id + '/reactions';
            }
            $.ajax({
                type: "post",
                url: request_url,
                headers: {
                    Authorization: 'Basic ' + window.localStorage.authorize,
                    Accept: 'application/vnd.github.squirrel-girl-preview+json'
                },
                data: JSON.stringify({
                    "content": "heart"
                }),
                success: function () {
                    reaction.num += 1;
                    reaction.isLike = true;
                    reaction.show(type, id);
                }
            });
        },
        getNum: function (type, id) {
            var reaction = this;
            var request_url = '';
            if (type == 'issue') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + id + '/reactions';
            } else if (type == 'comment') {
                request_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/comments/' + id + '/reactions';
            }
            $.ajax({
                type: "get",
                url: request_url + '?content=heart',
                headers: {
                    Accept: 'application/vnd.github.squirrel-girl-preview+json'
                },
                success: function (data) {
                    for (var i in data) {
                        if (data[i].user.login == window.localStorage.name) {
                            reaction.isLike = true;
                        }
                    }
                    reaction.num = data.length;
                    reaction.show(type, id);
                }
            });
        },
        show: function (type, id) {
            var reaction = this;
            if (reaction.isLike == false) {
                document.getElementById(id).innerHTML = '<img src="images/heart.svg" style="height:20px;float:left">';
            } else if (reaction.isLike == true) {
                document.getElementById(id).innerHTML = '❤️';
            }
            document.getElementById(id).innerHTML += reaction.num;
            document.getElementById(id).onclick = function () {
                reaction.like(type, id);
            };
        }
    }

    
    var Article = function () {
        this.comments = new Comment();
        this.page = new Pages();
        this.reaction = new Reaction();
        this.comment_url = "";
    }

    Article.prototype = {
        init: function () {
            var article = this;
            if (self.options.token != undefined && self.options.token != null) {
                window.localStorage.clear();
                window.localStorage.setItem("access_token", self.options.token);
                history.replaceState(null, config.title, 'content.html?id=' + self.options.id);
            }
            article.comment_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id + '/comments';
            article.page.getNum(article.comment_url);
            $.ajax({
                type: 'get',
                headers: {
                    Accept: 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json, application/x-www-form-urlencoded',
                },
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues/' + self.options.id,
                success: function (data) {
                    document.getElementById('title').innerHTML = data.title;
                    document.getElementsByTagName("title")[0].innerText = data.title + "-" + config.title;
                    data.created_at = self.utc2localTime(data.created_at);
                    document.getElementById('instruction').innerHTML = data.created_at;
                    document.getElementById('content').innerHTML = data.body_html;
                    var labels = document.getElementById('labels');
                    for (var i in data.labels) {
                        labels.innerHTML += '<a href="issue_per_label.html?label=' + data.labels[i].name + '"># ' + data.labels[i].name + '</a>';
                    }
                    labels.innerHTML += '<div style="float:right;cursor:pointer" id="' + self.options.id + '"></div>';
                    article.comments.init();
                    article.reaction.getNum('issue', self.options.id);
                }
            });
        }
    }

    var Issue = function () {
        this.issue_url = '';
        this.issue_perpage_url = '';
        this.issue_search_url = '';
        this.author = '';
        this.creator = '',
            this.state = '';
        this.page = new Pages();
    }

    Issue.prototype = {
        getTags: function () {
            $.ajax({
                type: 'get',
                url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/labels',
                success: function (data) {
                    for (var i in data) {
                        document.getElementById('tags').innerHTML += '<a href="issue_per_label.html?label=' + data[i].name + '">' + data[i].name + '</a>';
                    }
                },
            });
        },
        addItem: function (data) {
            document.getElementById('issue-list').innerHTML = '';
            for (var i in data) {
                var labels_content = '';
                for (var j in data[i].labels) {
                    labels_content += '<mdui-chip class="highlight montserrat" onclick="#" href=issue_per_label.html?label=' + data[i].labels[j].name + '>' + data[i].labels[j].name + '</mdui-chip>';
                }
                data[i].body = data[i].body.replace(/<.*?>/g, "");
                data[i].created_at = self.utc2localTime(data[i].created_at);
                document.getElementById('issue-list').innerHTML += '<li><p class="date">' + data[i].created_at + '</p><h3 class="title"><a class="highlight" href="content.html?id=' + data[i].number + '">' + data[i].title + '</a></h3><div class="excerpt"><p class="issue">' + data[i].body + '</p></div>' + '<li>' + '</li>' + labels_content + '</ul></li>';
            }
        },
        show: function (request_url) {
            var issue = this;
            $.ajax({
                type: 'get',
                url: request_url + 'page=' + self.options.page + '&per_page=10',
                success: function (data) {
                    if (self.options.q == undefined || self.options.q == null) {
                        if (data.length == 0) {
                            document.getElementById('issue-list').innerHTML = 'There are no articles under this label yet.';
                            $('.footer').css('position', 'absolute');
                        } else {
                            issue.addItem(data);
                        }
                    } else {
                        if (data.items.length == 0) {
                            window.location.href = '404.html';
                        } else {
                            issue.addItem(data.items);
                        }
                        var html = document.getElementById('issue-list').innerHTML;
                        var newHtml;
                        if (self.options.q != '')
                            newHtml = html.replaceAll(self.options.q, '<font style="background-color:yellow;">' + self.options.q + '</font>');
                        else
                            newHtml = html;
                        document.getElementById('issue-list').innerHTML = newHtml;
                    }
                }
            });
        },
        init: function () {
            if (config.filter.creator != undefined && config.filter.creator != null) {
                if (config.filter.creator == 'all') {
                    this.author = '';
                    this.creator = '';
                } else {
                    var authors = new Array();
                    authors = config.filter.creator.split(",");
                    for (var i in authors) {
                        this.author += 'author:' + authors[i] + '+';
                        this.creator += 'creator=' + authors[i] + '&';
                    }
                }
            } else {
                this.author = '';
                this.creator = '';
            }
            if (config.filter.state != undefined && config.filter.state != null) {
                this.state = config.filter.state;
            } else {
                this.state = 'all';
            }
            if (self.options.label == undefined) {
                if (self.options.q == undefined) {
                    this.issue_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo;
                    this.issue_perpage_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'state=' + this.state + '&';
                } else {
                    this.search(self.options.q);
                }
            } else {
                this.issue_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'labels=' + self.options.label + '&state=' + this.state;
                this.issue_perpage_url = 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/issues?' + this.creator + 'labels=' + self.options.label + '&state=' + this.state + '&';
                document.getElementById('title').innerHTML = self.options.label;
                $.ajax({
                    type: 'get',
                    headers: {
                        Accept: 'application/vnd.github.symmetra-preview+json',
                    },
                    url: 'https://api.github.com/repos/' + config.name + '/' + config.repo + '/labels/' + self.options.label,
                    success: function (data) {
                        document.getElementById('instruction').innerHTML = data.description;
                    }
                });
            }
            this.page.getNum(this.issue_url);
            this.show(this.issue_perpage_url);
            this.getTags();
        },
        search: function (search) {
            search = encodeURI(search);
            this.issue_url = 'https://api.github.com/search/issues?q=' + search + ' ' + this.author + 'in:title,body+repo:' + config.name + '/' + config.repo + '+state:' + this.state;
            this.issue_perpage_url = 'https://api.github.com/search/issues?q=' + search + ' ' + this.author + 'in:title,body+repo:' + config.name + '/' + config.repo + '+state:' + this.state + '&';
        }
    }

    var Buttons = function () { }

    Buttons.prototype = {
        getByClass: function (Parent, Class) {
            var result = [];
            var ele = Parent.getElementsByTagName('*');
            for (var i = 0; i < ele.length; i++) {
                if (ele[i].className == Class) {
                    result.push(ele[i]);
                }
            }
            return result;
        },
        init: function () {
            $('.navi-button').click(function () {
                if ($('.main').css("transform") == "matrix(1, 0, 0, 1, 0, 0)") {
                    $('.main').css("transform", "translateX(-150px)");
                    $('.main-navication span').css("opacity", "1");
                    $('.main-navication').css("opacity", "1");
                    $('.main-navication span').css("transform", "translateX(-10px)");
                    $('.navi-button').css("transform", "translateX(-150px)");
                    $('.Totop').css("transform", "translateX(-150px)");
                    $('.search').css("transform", "translateX(-150px)");
                    $('.search-input').css("transform", "translateX(-150px)");
                }
            });

            this.getByClass(document.getElementsByTagName("body")[0], "main")[0].addEventListener("mousedown", function () {
                if ($('.main').css("transform") != "matrix(1, 0, 0, 1, 0, 0)") {
                    $('.main').css("transform", "translateX(0)");
                    $('.main-navication span').css("opacity", "0");
                    $('.main-navication').css("opacity", "0");
                    $('.main-navication span').css("transform", "translateX(-50px)");
                    $('.navi-button').css("transform", "translateX(0px)");
                    $('.Totop').css("transform", "translateX(0px)");
                    $('.search').css("transform", "translateX(0px)");
                    $('.search-input').css("transform", "translateX(0px)");
                }
            }, false);

            $('.Totop').click(function () {
                $('html,body').animate({
                    scrollTop: '0px'
                },
                    600);
            });

            $('.search').click(function () {
                $(".search-input").css('z-index', 99);
                $(".search-input").css("width", '300px');
                $(".search-input").focus();
            });

            $('.search-input').bind('keypress',
                function (event) {
                    if (event.keyCode == "13" && $('.search-input').val() != "") {
                        window.location.href = 'issue_per_label.html?q=' + $('.search-input').val();
                    }
                })

            window.onscroll = function () {
                if ($(document).scrollTop() >= 0.6 * document.documentElement.clientHeight) {
                    $('.Totop').css('opacity', 1);
                } else {
                    $('.Totop').css('opacity', 0);
                }
            }
        }
    }

    self.init = function () {
        self.info = new Info();
        self.info.init();
        if (self.options.id != null && self.options.id != undefined) {
            self.content = new Article();
            self.content.init();
        } else {
            self.content = new Issue();
            self.content.init();
        }
        self.menu = new Menu();
        self.menu.show();
        self.footer = new Footer();
        self.footer.show();
        self.button = new Buttons();
        self.button.init();
    }

   }


$.ajax({
    type: 'get',
    headers: {
        Accept: 'application/json',
    },
    url: 'config.json',
    success: function (data) {
        new gitblog(data).init();
    }
});



/* drawer */
const navigationDrawer = document.getElementsByTagName("mdui-navigation-drawer")[0];
const btn = document.getElementsByTagName("mdui-button-icon")[0];
var menu = true;
btn.onclick = function () {
    if (menu) {
        navigationDrawer.open = true;
        menu = false;
    } else {
        navigationDrawer.open = false;
        menu = true;
    }
}

/* loading */
document.onreadystatechange = completeLoading;
function completeLoading() {
    if (document.readyState == "complete") {
        document.getElementById('loader-wrapper').style.display = "none";
    }
    else {
        document.getElementById('loader-wrapper').style.display = "block";
    }
}

const height = window.innerWidth
window.onload = function () {
    if (height > 850) {
        navigationDrawer.open = true;
    }
}






















var CURSOR;

Math.lerp = (a, b, n) => (1 - n) * a + n * b;

const getStyle = (el, attr) => {
    try {
        return window.getComputedStyle
            ? window.getComputedStyle(el)[attr]
            : el.currentStyle[attr];
    } catch (e) { }
    return "";
};


class Cursor {
    constructor() {
        this.pos = { curr: null, prev: null };
        this.pt = [];
        this.create();
        this.init();
        this.render();
    }

    move(left, top) {
        this.cursor.style["left"] = `${left}px`;
        this.cursor.style["top"] = `${top}px`;
    }

    create() {
        if (!this.cursor) {
            this.cursor = document.createElement("div");
            this.cursor.id = "cursor";
            this.cursor.classList.add("hidden");
            document.body.append(this.cursor);
        }

        var el = document.getElementsByTagName('*');
        for (let i = 0; i < el.length; i++)
            if (getStyle(el[i], "cursor") == "cursor")
                this.pt.push(el[i].outerHTML);
        document.body.appendChild((this.scr = document.createElement("style")));
        this.scr.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><circle cx='4' cy='4' r='4' opacity='.5'/></svg>") 4 4, auto !important}`;
    }



    init() {
        document.onmousemove = e => { (this.pos.curr == null) && this.move(e.clientX - 8, e.clientY - 8); this.pos.curr = { x: e.clientX - 8, y: e.clientY - 8 }; this.cursor.classList.remove("hidden"); };

    }

    render() {
        if (this.pos.prev) {
            this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.15);
            this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.15);
            this.move(this.pos.prev.x, this.pos.prev.y);
        } else {
            this.pos.prev = this.pos.curr;
        }
        requestAnimationFrame(() => this.render());
    }
}

(() => {
    CURSOR = new Cursor();
})();



const body = document.querySelector("html");
const element = document.getElementById("cursor");
const element2 = document.getElementById("pointer");
const halfAlementWidth = element.offsetWidth / 2;
const halfAlementWidth2 = element2.offsetWidth / 2;
let isHovering = false;

window.addEventListener("mouseover", (event) => {
    const target = event.target;

    if (target.classList.contains("highlight")) {
        isHovering = true;

        const rect = target.getBoundingClientRect();
        const style = window.getComputedStyle(target);

        element2.style.width = `${rect.width + 20}px`;
        element2.style.height = `${rect.height + 20}px`;
        element2.style.borderRadius = `${style.borderRadius}`;
        element2.style.transform = `translate(${rect.left - 10}px, ${rect.top - 10
            }px)`;
    }
});

window.addEventListener("mouseout", (event) => {
    const target = event.target;
    if (target.classList.contains("highlight")) {
        isHovering = false;

        element2.style.width = `42px`;
        element2.style.height = `42px`;
        element2.style.borderRadius = `50%`;
    }
});



body.addEventListener("mousemove", (e) => {
    window.requestAnimationFrame(function () {
        setPosition(e.clientX, e.clientY);
    });
});




function setPosition(x, y) {
    window.requestAnimationFrame(function () {
        element.style.transform = `translate(${x - halfAlementWidth}px, ${y - halfAlementWidth
            }px)`;

        if (!isHovering) {
            element2.style.transform = `translate(${x - halfAlementWidth2}px, ${y - halfAlementWidth2
                }px)`;
        }
    });
}



