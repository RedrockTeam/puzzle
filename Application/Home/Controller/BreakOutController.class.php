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
    private $appId = 'wx81a4a4b77ec98ff4'; //公众号的唯一标识
    private $state = 'auth'; //重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
    private $responseType = 'code'; //返回类型，请填写code
    private $scope = 'snsapi_userinfo'; //应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
    private $redirectUrl = 'http://hongyan.cqupt.edu.cn/puzzle/index.php/Home/BreakOut/index'; //授权后重定向的回调链接地址，请使用urlencode对链接进行处理
    private $authtUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=%s&redirect_uri=%s&response_type=%s&scope=%s&state=%s#wechat_redirect'; //微信授权地址

    /* 请求成功后重定向到以下地址
     * redirect_uri/?code=CODE&state=STATE。
     */

    public function index(){
        $this->antiCheat();
        $this->display();
    }
    public function intro(){
        $this->antiCheat();
        $this->display();
    }
    public function game(){
        $this->antiCheat();
        $this->display();
    }
    public function result(){
        $this->antiCheat();
        $this->display();
    }
    public function refresh(){
        $this->antiCheat();
        $this->display();
    }    
    //  五个页面
    public function authCallback(){
        $code = I('get.code');
        if(empty($code)){
            echo 'what are you doing';
            return;
        }
        $this->checkAuth($code);
    }

    public function submitScore(){
        header('Access-Control-Allow-Origin: *');
        $jsonStr = file_get_contents('php://input');
        @$json = json_decode($jsonStr, true);
        $jsonStatus = json_last_error();
        if($jsonStatus != JSON_ERROR_NONE){
            $response = array(
                'code' => 1,
                'msg' => 'json error'
            );
            $this->ajaxReturn($response);
        }
        if(!isset($json['phone']) || $json['phone'] == ''){
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
        $this->addScore($json['phone'], intval($json['use_time']), intval($json['barrier']));
    }

    private function addScore($phone, $useTime, $barrier){
        $score = M('breakout');
        $data = array('phone' => $phone, 'use_time' => $useTime, 'barrier' => $barrier); //useTime 为所花费的时间 单位秒
        $score->add($data);
        $response = array(
            'code' => 0,
            'msg' => 'ok'
        );
        $this->ajaxReturn($response);
    }

    public function getRank(){
        header('Access-Control-Allow-Origin: *');
        $barrier = intval(I('post.barrier'));
        $useTime = intval(I('post.use_time'));
        $breakout = M('breakout');
        $sql = "select barrier, use_time, create_time from breakout order by barrier desc, use_time asc, create_time asc";
        $rankList = $breakout->query($sql);
        $rank = $this->checkRank($rankList, $barrier, $useTime);
        $response = array(
            'code' => 0,
            'msg' => $rank
        );
        $this->ajaxReturn($response);

    }

    private function checkRank($rankList, $barrier, $useTime){
        $rankAmount = count($rankList);
        $rank = $rankAmount + 1;
        for($i = $rankAmount - 1; $i >= 0; --$i){
            if($barrier == $rankList[$i]['barrier']){
                if($useTime >= $rankList[$i]['use_time']){
                    $rank = $i + 2;
                }else{
                    $rank = $i + 1;
                }
            }elseif($barrier > $rankList[$i]['barrier']){
                $rank = $i + 1;
            }
        }
        return $rank;
    }

    private function antiCheat(){
        $getCode = I('get.code');
        $getState = I('get.state');
        $authCode = I('session.code');
        $authUrlFinal = $this->getAuthUrl();
        if(!empty($getCode) && $this->state == $getState){
            $code = $this->checkAuth($getCode);
            session('code', $code);
            return;
        }
        if(empty($authCode)){
            header('Location:'.$authUrlFinal);
            return;
        }
    }

    private function checkAuth($code){
        $randomStr = md5(time());
        $timeStamp = time();
        $t = array(
            'string' => $randomStr,
            'token' => 'gh_68f0a1ffc303',
            'timestamp' => time(),
            'secret' => sha1(sha1($timeStamp).md5($randomStr)."redrock"),
            'code' => $code,
        );
        $url = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/webOAuth";
        $result = $this->curl_api($url, $t);
        return $result->data->openid;
    }

    /*curl通用函数*/
    private function curl_api($url, $data=''){
        // 初始化一个curl对象
        $ch = curl_init();
        curl_setopt ( $ch, CURLOPT_URL, $url );
        curl_setopt ( $ch, CURLOPT_POST, 1 );
        curl_setopt ( $ch, CURLOPT_HEADER, 0 );
        curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt ( $ch, CURLOPT_POSTFIELDS, $data );
        // 运行curl，获取网页。
        $contents = json_decode(curl_exec($ch));
        // 关闭请求
        curl_close($ch);
        return $contents;
    }

    private function onAuthSuccess($code){
        session('code', $code);
        header('Location:'.U('Home/BreakOut/index'));
    }

    private function getAuthUrl(){
        $reUrlByUrlEncode = urlencode($this->redirectUrl);
        return sprintf($this->authtUrl, $this->appId, $reUrlByUrlEncode, $this->responseType, $this->scope, $this->state);
    }

    public function test(){
        $rlist = array(
//            array('barrier' => 4, 'use_time' => 14),
//            array('barrier' => 3, 'use_time' => 22),
//            array('barrier' => 3, 'use_time' => 25),
//            array('barrier' => 2, 'use_time' => 25),
//            array('barrier' => 2, 'use_time' => 90),
//            array('barrier' => 1, 'use_time' => 40)
        );

        echo $this->checkRank($rlist, I('get.barrier'), I('get.use_time'));
    }

    public function showScore(){
        $s = M('breakout');
        $sql = "select barrier, use_time, create_time from breakout order by barrier desc, use_time asc, create_time asc";
        $r = $s->query($sql);
        var_dump($r);
    }
}