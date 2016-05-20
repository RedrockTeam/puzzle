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

    /*
     * 用户同意授权，获取code
     * 请求参数
     */
    private $appId = 'appid'; //公众号的唯一标识
    private $state = 'auth'; //重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
    private $responseType = 'code'; //返回类型，请填写code
    private $scope = 'snsapi_userinfo'; //应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
    private $redirectUrl = 'http://hongyan.cqupt.edu.cn/puzzle/index.php/Hone/BreakOut/authCallback'; //授权后重定向的回调链接地址，请使用urlencode对链接进行处理
    private $authtUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=%s&redirect_uri=%s&response_type=%s&scope=%s&state=%s#wechat_redirect'; //微信授权地址

    /* 请求成功后重定向到以下地址
     * redirect_uri/?code=CODE&state=STATE。
     */

    /*
     * 取得code后发起请求获得access_token
     * 请求参数
     * appid 上面定义
     */
    private $secret = 'ss'; //公众号的appsecret
    private $grantType = 'authorization_code'; //填写为authorization_code
    private $authTokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=%s';

    /*
     * 返回结果 具体参见 see to:https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842&token=&lang=zh_CN
     */
    /*正确
     { "access_token":"ACCESS_TOKEN",
    "expires_in":7200,
    "refresh_token":"REFRESH_TOKEN",
    "openid":"OPENID",
    "scope":"SCOPE" }
    错误
    {"errcode":40029,"errmsg":"invalid code"}
    */

    /*
     * 通过access_token获取用户信息
     */

    public function index(){
        $this->antiCheat();
        $this->display();
    }

    public function authCallback(){
        $code = I('get.code');
        if(empty($code)){
            echo 'what are you doing';
        }
        $this->weChatAuth($code);
    }

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
        if(is_numeric(intval($json['use_time'])) || is_numeric(intval($json['barrier']))){
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
        $this->getRank($useTime, $barrier);
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

    private function weChatAuth($code){
        $authTokenUrlFinal = sprintf($this->authTokenUrl, $this->appId, $this->secret, $code, $this->grantType);
        $resultJson = file_get_contents($authTokenUrlFinal);
        $resultArr = json_decode($resultJson, true);
        if(key_exists('errcode', $resultArr)){
            echo '<script>alert("认证失败");</script>';
            return;
        }
        $this->onAuthSuccess($code);
    }

    private function antiCheat(){
        //取出I函数的值到变量，使empty兼容低版本php
        $getCode = I('get.code');
        $getState = I('get.state');
        $authCode = I('session.code');
        $authUrlFinal = $this->getAuthUrl();
        if(!empty($getCode) && $this->state == $getState){
            $this->weChatAuth($getCode);
            return;
        }
        if(empty($authCode)){
            header('Location:'.$authUrlFinal);
            return;
        }
    }

    private function onAuthSuccess($code){
        session('code', $code);
        header('Location:'.U('Home/BreakOut/index'));
    }

    private function getAuthUrl(){
        $reUrlByUrlEncode = urlencode($this->redirectUrl);
        return sprintf($this->authtUrl, $this->appId, $reUrlByUrlEncode, $this->responseType, $this->scope, $this->state);
    }
}