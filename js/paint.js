
var $client_id=164;
getAssetConfig($client_id);

function asset_round(data){
    var weight = (Math.round(data * 10000)/100).toFixed(2);
    return weight
}
function getAssetConfig($id){
    $.ajax({
          url: 'data/cdata',
          type: 'GET',
          dataType: 'json',
          contentType:'application/json',
          beforeSend:function(){
            $("#loading").show();
          }, 
          success: function(data){
          console.log("test01");
              $("#loading").fadeOut(500);
            if(data.success == true){
                var str = data.data;
                $('#tbody').empty()

                //表格数据
                var asset_name = [];
                var asset_key = [];
                $.each(str.ef_curve.asset,function(index,ele){
                    $.each(ele,function(i,v){
                         asset_name.push(v);
                         asset_key.push(i);
                    })
                })
                var tbody = '';
                var formatData = [];
                for(var i=0;i<asset_key.length;i++){
                    for(var key in str.static_table.row) {
                        if(key == asset_key[i]) {
                            str.static_table.row['key'] = key;
                            formatData.push(str.static_table.row[key]);
                        }
                    }
                }
                for(var i=0; i< formatData.length; i++){
                    var ele = formatData[i];
                    tbody += '<tr class="n">';
                    tbody += '<td>'+ele.name+'</td>'
                    if(ele.value < 1){
                        tbody += '<td>'+ele.value.toFixed(2)+'</td>'
                    }else if(ele.value > 1){
                        tbody += '<td>'+String(ele.value.toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ',')+'</td>'
                    }
                    tbody += '<td>'+(Math.round(ele.weight * 10000)/100).toFixed(2)+'%</td>'
                    tbody += '<td></td>'
                    tbody += '<td></td>'
                    tbody += '<td></td>'
                    tbody += '<td>'+(Math.round(ele.model_r * 10000)/100).toFixed(2)+'%</td>'
                    tbody += '<td>'+(Math.round(ele.model_sigma * 10000)/100).toFixed(2)+'%</td>'
                    tbody += '</tr>';
                }
                tbody += '<tr><td rowspan="3" class="comp">组合描述</td><td>当前市值</td><td>'+String(str.static_table.capital).replace(/\B(?=(?:\d{3})+\b)/g, ',')+'</td><td>组合当前收益率</td><td class="comp_r">'+(Math.round(str.ef_curve.points[0].r * 10000)/100).toFixed(2)+'%'+'</td><td></td><td>组合当前波动率</td><td class="comp_s">'+(Math.round(str.ef_curve.points[0].sigma * 10000)/100).toFixed(2)+'%</td></tr>';
                tbody +='<tr><td>增量金额</td><td>'+String(str.static_table.increase_money.toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ',')+'</td><td>权益配置</td><td class="equity_w">'+Number(str.ef_curve.points[0].equityW).toFixed(2)+'</td><td></td><td>风险乘数</td><td class="risk_m">'+Number(str.ef_curve.points[0].risk_multiplier).toFixed(2)+'</td><td></td></tr>';
                tbody +='<tr><td>权益可接受最大亏损</td><td class="equity_ml">'+String(str.ef_curve.points[0].equity_max_loss.toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ',')+'</td><td></td><td></td><td></td><td></td><td></td></tr>';
               
                $('#tbody').append(tbody)

                $.each($('#tbody tr.n'),function(k,n){
                    //$('#tbody tr').eq(k).find('td').eq(3).html(Number(str.ef_curve.points[0].weight[k]).toFixed(2));
                    $('#tbody tr').eq(k).find('td').eq(3).html(asset_round(str.ef_curve.points[0].weight[k])+'%');
                    $('#tbody tr').eq(k).find('td').eq(4).html(String(str.ef_curve.points[0].value[k].toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ','));
                    $('#tbody tr').eq(k).find('td').eq(5).html(String(str.ef_curve.points[0].diff[k].toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ','));
                })
                
                var pie2_label = [];
                $.each(str.ef_curve.current_point.weight,function(index,ele){
                    if(ele!=0){
                        var arr = {value:ele.toFixed(4), name:asset_name[index]}
                        pie2_label.push(arr)
                    }
                })

                //第一个图表数据
                var label = [];
                var label_x = [];
                var label_y = [];
                $.each(str.ef_curve.points,function(index,ele){
                    label_x.push(ele.sigma)
                    label_y.push(ele.r)
                })
                for(var i=0;i<label_x.length;i++){
                    var label_total = []
                    label_total.push(label_x[i])
                    label_total.push(label_y[i])
                    label.push(label_total)
                }
                var label2 = [];
                var label2_x = [];
                var label2_y = [];
                var label_all = [];
                if(str.pre_scheme.points){
                    $.each(str.pre_scheme.points,function(index,ele){
                        label2_x.push(ele.sigma)
                        label2_y.push(ele.r)
                    })
                    for(var j=0;j<label2_x.length;j++){
                        var label2_total = []
                        label2_total.push(label2_x[j])
                        label2_total.push(label2_y[j])
                        label2.push(label2_total)
                    }
                    label_all.push(label,label2)
                }else{
                    label_all.push(label)
                }



                //激进、平衡、保守三点数据
                var point_x = {};
                var point_y = {};
                var pie3_label = [];
                var pie4_label = [];
                var pie5_label = [];
                $.each(str.ef_curve.points,function(index,ele){
                      if(index == str.ef_curve.growth.point){
                             point_x.growth=ele.sigma
                             point_y.growth=ele.r
                             $.each(ele.weight,function(i,v){
                                 if(v < 0.0001){
                                 }else{
                                     var arr = {value:Number(v).toFixed(4),name:asset_name[i]}
                                     pie3_label.push(arr)
                                 }
                             })
                      }else if(index == str.ef_curve.moderate.point){

                             point_x.moderate=ele.sigma
                             point_y.moderate=ele.r
                             $.each(ele.weight,function(i,v){
                                 if(v < 0.0001){
                                 }else{
                                     var arr = {value:Number(v).toFixed(4),name:asset_name[i]}
                                     pie4_label.push(arr)
                                 }
                             })
                      }else if(index == str.ef_curve.conservative.point){

                             point_x.conservative=ele.sigma
                             point_y.conservative=ele.r
                             $.each(ele.weight,function(i,v){
                                 if(v < 0.0001){
                                 }else{
                                     var arr = {value:Number(v).toFixed(4),name:asset_name[i]}
                                     pie5_label.push(arr)
                                 }
                             })
                      }
                })

                //动态饼图
                var pie_label = [];
                $.each(str.ef_curve.points[0].weight,function(index,ele){
                    if(ele < 0.0001){
                    }else{
                      var arr = {value:Number(ele.toFixed(4)), name:asset_name[index]}
                      pie_label.push(arr)
                    }
                })

                var line1 = echarts.init(document.getElementById('line1'));
                var pie1 = echarts.init(document.getElementById('pie1'));
                var bar1 = echarts.init(document.getElementById('bar1'));
                getLine1(line1);
                getpie1(pie1);
                getbar1(bar1);

                //有效前沿点图表
                function getLine1(line1){
                   option = {
                          grid: {
                              left: '3%',
                              right: '7%',
                              bottom: '3%',
                              containLabel: true
                          },
                          tooltip : {
                              trigger: 'axis',
                              showDelay : 0,
                              //formatter : function (params) {
                              //    if(params.value==undefined)
                              //    {
                              //      return '风险: '+params.data.xAxis.toFixed(4)+' ,收益：'+params.data.yAxis.toFixed(4);
                              //    }
                              //    else
                              //    {
                              //      if (params.value.length > 1) {
                              //        return '风险：'
                              //         + params.value[1].toFixed(4) + ' , 收益：'
                              //         + params.value[0].toFixed(4)
                              //      }else{
                              //        return params.value[1].toFixed(4)
                              //         + params.value[0].toFixed(4)
                              //      }
                              //    }
                              //
                              //},
                              formatter : function (params) {
                                  if(params.value==undefined)
                                  {
                                      return '收益: '+(Math.round(params.data.yAxis*10000)/100).toFixed(2)+'% ,风险：'+(Math.round(params.data.xAxis*10000)/100).toFixed(2)+'%';
                                  }
                                  else
                                  {
                                      if (params.value.length > 1) {
                                          return '收益：'
                                              + (Math.round(params.value[1]*10000)/100).toFixed(2) + '% , 风险：'
                                              + (Math.round(params.value[0]*10000)/100).toFixed(2)+'%'
                                      }else{
                                          return (Math.round(params.value[1]*10000)/100).toFixed(2)
                                              +  (Math.round(params.value[0]*10000)/100).toFixed(2)
                                      }
                                  }

                              },
                              axisPointer:{
                                  show: true,
                                  type : 'cross',
                                  lineStyle: {
                                      type : 'dashed',
                                      width : 1
                                  }
                              }
                          },
                          xAxis : [
                              {
                                  type : 'value',
                                  scale:true,
                                  axisLabel : {
                                      formatter: '{value}',
                                      textStyle:{
                                        color:'#fff'
                                      }
                                  },
                                  splitLine: {
                                    show:false,
                                    lineStyle: {
                                      type: 'dashed',
                                      color: '#766080',
                                    }
                                    
                                  },
                                  name:'风险',
                                  nameTextStyle: {
                                    color: '#fff'
                                  }
                              }
                          ],
                          yAxis : [
                              {
                                  type : 'value',
                                  scale:true,
                                  axisLabel : {
                                      formatter: '{value}',
                                      textStyle:{
                                        color:'#fff'
                                      }
                                  },
                                  splitLine: {
                                    lineStyle: {
                                      type: 'dashed',
                                      color: '#766080',
                                    }
                                    
                                  },
                                  nameTextStyle: {
                                    color: '#fff'
                                  },
                                  name:'收益'
                              }
                          ],
                          series :[
                             {
                              type:'scatter',
                              data:label_all[0],
                              symbolSize: 5,
                              zlevel:100,
                              markPoint : {
                                    data : [
                                       {label: 'current',name: '当前点', xAxis:str.ef_curve.current_point.sigma,yAxis:str.ef_curve.current_point.r},
                                       {label: 'growth',name: '激进', xAxis:point_x.growth,yAxis:point_y.growth},
                                       {label: 'moderate',name: '保守', xAxis:point_x.moderate,yAxis:point_y.moderate},
                                       {label: 'conservative',name: '平衡', xAxis:point_x.conservative,yAxis:point_y.conservative}
                                    ],
                                    itemStyle : {
                                       normal:{
                                         label: {
                                           show: true,
                                           formatter: function (params,ticket,callback){
                                                 return params.name;
                                           },
                                           textStyle:{
                                               color:'#000'
                                           }
                                         },
                                           color:'#FFAE00'
                                       }
                                    },
                                    symbolSize: 70,
                                    symbol:'pin'
                               }
                             },
                              {
                                  type:'scatter',
                                  data:label_all[1],
                                  symbolSize: 5
                              }
                          ]
                      };

                      line1.setOption(option);
                }
                
                //动态饼状图
                function getpie1(pie1){
                     option = {
                         title: {
                             text: '选中点',
                             left:'center',
                             textStyle:{
                                 color:'#fff'
                             }
                         },
                          tooltip : {
                              trigger: 'item',
                              formatter: "{a} <br/>{b} : {d}%"
                          },
                          series : [
                              {
                                  name: '权重',
                                  type: 'pie',
                                  radius : '55%',
                                  center: ['50%', '60%'],
                                  data:pie_label,
                                  itemStyle: {
                                      emphasis: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                                      }
                                  }
                              }
                          ]
                      };
                      pie1.setOption(option);
                }

                //动态柱状图
                function getbar1(bar1){
                  option = {
                      title: {
                          text: '选中点',
                          left:'center',
                          textStyle:{
                              color:'#fff'
                          }
                      },
                      tooltip : {
                          trigger: 'axis',
                          formatter:'{a}:{c}%'
                      },
                      grid:{
                        left:'center'
                      },
                      calculable : true,
                      xAxis : [
                         {
                            type : 'category',
                            data : ['预期年化收益率'],
                            axisLabel : {
                               formatter: '{value}',
                               textStyle:{
                                  color:'#fff'
                               }           
                            }
                         }
                      ],
                      yAxis : [
                          {
                              type : 'value',
                              axisLabel: {
                                  formatter:'{value}%',
                                textStyle: {
                                   color:'#fff'
                                }
                              }
                          }
                      ],
                      series : [
                          {
                              name:'预期年化收益率',
                              type:'bar',
                              data:[(Math.round(str.ef_curve.points[0].r * 10000)/100).toFixed(2)],
                              barWidth: 50
                          }
                      ]
                  };
                  bar1.setOption(option);  

                }


                line1.on('mouseover', function (params) {
                   if (params.componentType === 'series' || params.componentType === 'markPoint') {
                       if(params.name != "当前点"){
                           var index = params.dataIndex;
                           var data_name = params.name;
                           if(params.componentType === 'markPoint'){
                               switch (data_name){      //find data
                                   case "激进":
                                       index = str.ef_curve.growth.point;
                                       break;
                                   case "保守":
                                       index = str.ef_curve.moderate.point;
                                       break;
                                   case "平衡":
                                       index = str.ef_curve.conservative.point;
                                       break;
                               }

                           }
                           //update table
                           $.each(str.ef_curve.points,function(i,v){
                               if(i == index){
                                   $.each($('#tbody tr.n'),function(k,n){
                                       //$('#tbody tr.n').eq(k).find('td').eq(3).html(Number(v.weight[k]).toFixed(2));
                                       $('#tbody tr.n').eq(k).find('td').eq(3).html(asset_round(v.weight[k])+'%');
                                       $('#tbody tr.n').eq(k).find('td').eq(4).html(String(v.value[k].toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ','));
                                       $('#tbody tr.n').eq(k).find('td').eq(5).html(String(v.diff[k].toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ','));
                                   })
                                   $('#tbody tr .comp_r').html((Math.round(v.r * 10000)/100).toFixed(2)+'%');
                                   $('#tbody tr .comp_s').html((Math.round(v.sigma * 10000)/100).toFixed(2)+'%');
                                   $('#tbody tr .equity_w').html(Number(v.equityW).toFixed(2));
                                   $('#tbody tr .risk_m').html(Number(v.risk_multiplier).toFixed(2));
                                   $('#tbody tr .equity_ml').html(String(v.equity_max_loss.toFixed(2)).replace(/\B(?=(?:\d{3})+\b)/g, ','));

                                   var pie1_label_new = [];
                                   $.each(v.weight,function(k,n){
                                       if(n < 0.0001){
                                       }else{
                                           var arr = {value:Number(n.toFixed(4)), name:asset_name[k]}
                                           pie1_label_new.push(arr)
                                       }
                                   })
                                   //update pie1
                                   pie1.setOption({
                                       series : [
                                           {
                                               data:pie1_label_new
                                           }
                                       ]
                                   })
                                   //update pie2
                                   bar1.setOption({
                                       series : [
                                           {
                                               data:[(Math.round(v.r * 10000)/100).toFixed(2)]
                                           }
                                       ]
                                   })
                               }
                           })
                       }

                  }
                })

                //静态图表----------------
                var pie2 = echarts.init(document.getElementById('pie2'));
                var bar2 = echarts.init(document.getElementById('bar2'));
                getpie2(pie2);
                getbar2(bar2);

                function getpie2(pie2){
                     option = {
                         title: {
                             text: '当前点',
                             left:'center',
                             textStyle:{
                                 color:'#fff'
                             }
                         },
                          tooltip : {
                              trigger: 'item',
                              formatter: "{a} <br/>{b} : {d}%"
                          },
                          series : [
                              {
                                  name: '权重',
                                  type: 'pie',
                                  radius : '55%',
                                  center: ['50%', '60%'],
                                  data:pie2_label,
                                  itemStyle: {
                                      emphasis: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                                      }
                                  }
                              }
                          ]
                    };
                    pie2.setOption(option);
                }

                function getbar2(bar2){
                  option = {
                      title: {
                          text: '当前点',
                          left:'center',
                          textStyle:{
                              color:'#fff'
                          }
                      },
                      tooltip : {
                          trigger: 'axis',
                          formatter:'{a}:{c}%'
                      },
                      grid:{
                        left:'center'
                      },
                      calculable : true,
                      xAxis : [
                         {
                            type : 'category',
                            data : ['预期年化收益率'],
                            axisLabel : {
                               //formatter: '{value}%',
                               textStyle:{
                                  color:'#fff'
                               }           
                            }
                         }
                      ],
                      yAxis : [
                          {
                              type : 'value',
                              axisLabel: {
                                  formatter:'{value}%',
                                textStyle: {
                                   color:'#fff'
                                }
                              }
                          }
                      ],
                      series : [
                          {
                              name:'预期年化收益率',
                              type:'bar',
                              data:[(Math.round(str.ef_curve.current_point.r * 10000)/100).toFixed(2)],
                              barWidth: 50
                          }
                      ]
                  };
                  bar2.setOption(option);  
                }
                

                //激进平衡保守点饼图
                var pie3 = echarts.init(document.getElementById('pie3'));
                var pie4 = echarts.init(document.getElementById('pie4'));
                var pie5 = echarts.init(document.getElementById('pie5'));
                getpie3(pie3);
                getpie4(pie4);
                getpie5(pie5);

                function getpie3(pie3){
                     option = {
                          title:{
                             text:'激进',
                             textStyle: {
                                color:'#fff'
                             }
                          },
                          tooltip : {
                              trigger: 'item',
                              formatter: "{a} <br/>{b} : {d}% "
                          },
                          series : [
                              {
                                  name: '权重',
                                  type: 'pie',
                                  radius : '55%',
                                  center: ['50%', '60%'],
                                  data:pie3_label,
                                  itemStyle: {
                                      emphasis: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                                      }
                                  }
                              }
                          ]
                    };
                    pie3.setOption(option);
                }

                function getpie4(pie4){
                     option = {
                          title:{
                             text:'保守',
                             textStyle: {
                                color:'#fff'
                             }
                          },
                          tooltip : {
                              trigger: 'item',
                              formatter: "{a} <br/>{b} : {d}%"
                          },
                          series : [
                              {
                                  name: '权重',
                                  type: 'pie',
                                  radius : '55%',
                                  center: ['50%', '60%'],
                                  data:pie4_label,
                                  itemStyle: {
                                      emphasis: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                                      }
                                  }
                              }
                          ]
                    };
                    pie4.setOption(option);
                }

                function getpie5(pie5){
                    //改
                    var markLineOpt = {
                        animation: false,
                        label: {
                            normal: {
                                formatter: 'y=收益20.54%,x=风险11.28%',
                                textStyle: {
                                    align: 'right'
                                }
                            }
                        },
                        data: [[{

                        }, {
                            coord: [0.11, 0.20],
                            symbol: 'none'
                        }]]
                    };
                     option = {
                          title:{
                             text:'平衡',
                             textStyle: {
                                color:'#fff'
                             }
                          },
                          tooltip : {
                              trigger: 'item',
                              formatter: "{a} <br/>{b} : {d}%"
                          },
                          series : [
                              {
                                  name: '权重',
                                  type: 'pie',
                                  radius : '55%',
                                  center: ['50%', '60%'],
                                  data:pie5_label,
                                  itemStyle: {
                                      emphasis: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                                      }
                                  }
                              }
                          ]

                    };
                    pie5.setOption(option);
                }

                //回测数据
                var bt_label = [];
                $.each(str.back_test,function(index,ele){
                    var nv = [];
                    $.each(ele.nv,function(i,v){
                         nv.push(Number(v.toFixed(4)))
                    })
                    var arr =  {name:ele.name,type:'line',data:nv}
                    bt_label.push(arr)
                })



                var line2 = echarts.init(document.getElementById('line2'));
                getline2(line2)

                function getline2(line2){
                   var option = '';
                       option = {
                        tooltip: {
                          trigger: 'axis'
                        },
                        grid: {
                          left: '3%',
                          right: '4%',
                          bottom: '3%',
                          containLabel: true
                        },
                        xAxis: {
                          type: 'category',
                          boundaryGap: false,
                          data: str.back_test.hold.date,
                          axisLabel : {
                            textStyle:{
                              color:'#fff'
                            }
                          },
                          splitLine:{
                            show:false
                          }
                        },
                        yAxis: {
                          type: 'value',
                          axisLabel : {
                            textStyle:{
                              color:'#fff'
                            }
                          },
                          splitLine:{
                            lineStyle: {
                              color: '#61A0A8'
                                //424159
                              //  color:'#ccc'
                            }
                          } 
                        },
                        series: bt_label
                    };
                    line2.setOption(option);
                }

            }else{
                dialog.errorTips(data.errorDesc)
            }
          },
          error:function(data){
                $("#loading").fadeOut(500);
                dialog.errorTips("该客户无数据")
          }
    });
}
