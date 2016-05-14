<?php
/**
 * Created by PhpStorm.
 * User: Nobup
 * E-mail: mail@vekwu.com
 * Date: 2016/5/14 0014
 * Time: 17:45
 */

namespace Home\Controller;


use Think\Controller;
use Think\Exception;

class BreakOutController extends Controller{

    public function submitScore(){
        $jsonStr = file_get_contents('php://input');
        @$json = json_decode($jsonStr, true);
        $jsonStatus = json_last_error();
        if($jsonStatus != JSON_ERROR_NONE){
            $response = array(
                'code' => 1,
                'msg' => 'fail'
            );
            $this->ajaxReturn($response);
        }
        if(empty($json['phone'])){
            $response = array(
                'code' => 2,
                'msg' => 'please input phone number'
            );
            $this->ajaxReturn($response);
        }else{
            $pattern = '/^13|15|18|17[0-9]{1}[0-9]{8}$/';
            $regRes = preg_match($pattern, $json['phone']);
            if($regRes == 0){
                $response = array(
                    'code' => 3,
                    'msg' => 'phone number is illegal'
                );
                $this->ajaxReturn($response);
            }
        }
        if(empty($json['use_time']) || empty($json['barrier'])){
            $response = array(
                'code' => 4,
                'msg' => 'illegal param'
            );
            $this->ajaxReturn($response);
        }
        $this->addScore($json['phone'], intval($json['use_time']), intval($json['barrier']));
    }

    private function addScore($phone, $useTime, $barrier){
        $score = M('breakout');
        $data = array('phone' => $phone, 'use_time' => $useTime, 'barrier' => $barrier); //useTime 为所花费的时间 单位秒
        $score->add($data);
    }

    private function getRank($useTime, $barrier){
        $score = M('breakout');
        $initSql = 'SET @rank = 0';
        $sql = "select rank from (select use_time, barrier, @rank := @rank + 1 as rank from breakout order by barrier DESC, use_time ASC) as rank_table where use_time = {$useTime} and barrier = {$barrier}";
        $score->execute($initSql);
        $rank = $score->query($sql);
        if($rank != null){
            $response = array(
                'code' => 0,
                'msg' => $rank[0]['rank']
            );
            $this->ajaxReturn($response);
        }else{
            $response = array(
                'code' => 5,
                'msg' => 'un_know error'
            );
            $this->ajaxReturn($response);
        }
    }
}