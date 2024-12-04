<div align=center>
  <img width="1500" alt="logo" src="https://github.com/user-attachments/assets/c119a31f-2ff3-4938-990f-b382980a1a20">
</div>

<br>

<div align=center>

<p align=center>
  <a href="https://inquisitive-beret-c36.notion.site/12855cd93d4f800b91bccc3ccf9d1444?pvs=74">팀 노션</a>
  &nbsp; | &nbsp; 
  <a href="https://github.com/orgs/boostcampwm-2024/projects/212">프로젝트</a>
  &nbsp; | &nbsp;
  <a href="https://www.figma.com/design/Gl1naj84mDIWkG7IHZoVpo/%EC%9B%A8%EB%B2%A0%EB%B2%B1-UI-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=71-124&t=acRqurOAstA2WU8J-1">피그마</a>
  &nbsp; | &nbsp; 
  <a href="https://github.com/boostcampwm-2024/web30-stop-troublepainter/wiki">위키</a>
  <br>
  <a href="https://www.troublepainter.site/">배포 링크</a>
  &nbsp; | &nbsp; 
  <a href="https://boostcampwm-2024.github.io/web30-stop-troublepainter/">TypeDoc</a>
  &nbsp; | &nbsp; 
  <a href="https://boostcampwm-2024.github.io/web30-stop-troublepainter/storybook-develop/?path=/docs/">Storybook</a>
</p>

<div align=center>
  <a href="https://hits.seeyoufarm.com">
    <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fboostcampwm-2024%2Fweb30-stop-troublepainter&count_bg=%231264A3&title_bg=%23323845&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false"/>
  </a>
</div>
</div>

## 프로젝트 소개

**방해꾼은 못말려**는 그림을 보고 정답을 맞히는 **실시간 드로잉 퀴즈 게임**입니다

🎨 **그림꾼**: 제시어를 그림으로 표현하며 창의력을 발휘하세요

🕵️ **방해꾼**: 그림꾼을 방해하며 혼란을 선사하세요

🤔 **구경꾼**: 그림을 추리하고 정답을 맞춰 승리하세요

**지금 바로 친구들과 함께 즐겨보세요!**

## 핵심 기술
* `서드파티 라이브러리 없이 Canvas API를 활용`하여 색상 선택, 스트로크 조절, Undo/Redo와 같은 **드로잉 툴의 핵심 기능을 제공**하고 있습니다.

* `소켓 통신`과 `LWW(Last-Write-Wins) 기반 CRDT 알고리즘`을 통해 실시간 동기화를 보장하며 모든 사용자가 **동일한 캔버스 상태**를 안정적으로 공유할 수 있도록 했습니다.

## 주요 기능

### 🔗 회원가입 없이 URL 하나로 게임 시작하기!

> 클릭 한 번으로 게임방이 생성되고, 복사된 URL을 공유하면 누구나 쉽게 참여할 수 있습니다.

<table>
  <tr align="center">
    <td>
      <img
        src="https://github.com/user-attachments/assets/b5e30034-3812-47c3-9848-ffdee2fecf6c"
        alt="방 만들기 화면" />
    </td>
    <td>
      <img
        src="https://github.com/user-attachments/assets/6de8a304-4391-42eb-81e4-fbffa9273089"
        alt="초대하기 화면"/>
    </td>
  </tr>
  <tr align="center">
    <td>방 만들기 및 초대 공유!</td>
    <td>대기실 입장!</td>
  </tr>
</table>

### 🎭 신나는 역할 체인지 게임!

> 라운드마다 무작위로 그림꾼 & 방해꾼, 구경꾼으로 역할이 나뉘어 서로 다른 재미를 느낄 수 있습니다.

<table>
  <tr align="center">
    <td>
      <img src="https://github.com/user-attachments/assets/5a925f82-44e6-4368-9282-276f79642a46" alt="역할 배정 화면"/>
    </td>
  </tr>
  <tr align="center">
    <td>게임 시작 후 비밀스러운 역할 배정!</td>
  </tr>
</table>

### 🖌️ 기본에 충실한 드로잉 도구!

> Canvas API의 기본 기능으로 완성도 높은 드로잉 기능을 제공합니다.

<table>
  <tr align="center">
    <td>
      <img
        src="https://github.com/user-attachments/assets/92298289-543c-4643-8926-5e08d9e17a7f"
        alt="드로잉 도구 시연"
      />
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/0f0a6cf8-735d-4242-ba23-f5e1bcf69ff1" alt="Undo/Redo 기능" />
    </td>
  </tr>

  <tr align="center">
    <td>다채로운 색상, 두께를 변경할 수 있는 직관적인 도구 사용 가능!</td>
    <td>Undo/Redo 기능!</td>
  </tr>
</table>

### 🎨 방해꾼과 그림꾼이 실시간으로 하나의 캔버스에서 대결해요!

> 소켓 통신과 CRDT 기반으로 서로의 붓질이 실시간으로 동기화되어 긴장감 넘치는 그리기 대결을 즐길 수 있습니다.

<table>
  <tr align="center">
    <td>
      <img src="https://github.com/user-attachments/assets/e450f56a-f112-4d07-8323-b1571748ec10" alt="실시간 그리기 화면" />
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/99e242f4-7ec8-4867-9198-9081223b4bd3" alt="동시 그리기 화면" />
    </td>
  </tr>
  <tr align="center">
    <td>실시간으로 그려지는 붓질</td>
    <td>동시에 여러 명이 그리기</td>
  </tr>
</table>

### 🎉 게임 종료와 함께 공개되는 최종 결과!

> 정체를 숨기고 있던 방해꾼이 밝혀지는 흥미진진한 순간을 함께 즐겨보세요!

<table>
  <tr align="center">
    <td>
      <img src="https://github.com/user-attachments/assets/cfc0539e-b033-41cd-9250-8861fe2a2fc0" alt="결과 발표 화면"/>
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/7853b0de-499b-4141-a10e-47f3159e1089" alt="최종 순위 화면"/>
    </td>
  </tr>
  <tr align="center">
    <td>방해꾼의 정체 공개</td>
    <td>최종 순위 발표</td>
  </tr>
</table>

<br />

## 기술 스택

<div align=center>
  <img src="https://github.com/user-attachments/assets/92d37463-6144-4353-a9ec-81087fbd1a35" width="700"/>
</div>

<table align=center>
    <thead>
        <tr>
            <th>Category</th>
            <th>Stack</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <p align=center>Common</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/Socket.io-010101?logo=Socket.io">
                <img src="https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=ffffff">
                <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=Eslint">
                <img src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=ffffff">
                <img src="https://img.shields.io/badge/.ENV-ECD53F?logo=.ENV&logoColor=ffffff">
            </td>
        </tr>
        <tr>
            <td>
                  <p align=center>Frontend</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Vite-646CFF?logo=Vite&logoColor=ffffff">
                <img src="https://img.shields.io/badge/React-61DAFB?logo=React&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=ffffff">
                <img src="https://img.shields.io/badge/React_Query-FF4154?logo=reactquery&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Zustand-443E38?logo=react&logoColor=ffffff">
            </td>
        </tr>
        <tr>
            <td>
                <p align=center>Backend</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Node.js-114411?logo=node.js">
                <img src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=ffffff">
            </td>
        </tr>
        <tr>
            <td>
                <p align=center>Deployment</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/nginx-014532?logo=Nginx&logoColor=009639&">
                <img src="https://img.shields.io/badge/Naver Cloud Platform-03C75A?logo=naver&logoColor=ffffff">  
                <img src="https://img.shields.io/badge/GitHub Actions-2088FF?logo=GitHub Actions&logoColor=ffffff">
            </td>
        </tr>
        <tr>
            <td>
                <p align=center>Collaboration</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/Notion-000000?logo=Notion">
                <img src="https://img.shields.io/badge/Figma-F24E1E?logo=Figma&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Slack-4A154B?logo=Slack&logoColor=ffffff">
            </td>
        </tr>
    </tbody>
</table>

<br>

## 웨베베베벱 팀 소개

5명의 못말리는 FE 개발자들이 모인 팀이에요. 현재 프로젝트에서 저희는 5명 전부 풀스택을 담당합니다!

<table align="center">
  <tr>
    <th><a href="https://github.com/kwaksj329">곽수정</a></th>
    <th><a href="https://github.com/rhino-ty">윤태연</a></th>
    <th><a href="https://github.com/sweetyr928">유미라</a></th>
    <th><a href="https://github.com/aeujoung">정다솔</a></th>
    <th><a href="https://github.com/choiseona">최선아</a></th>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/51fab285-bd79-420e-8626-c0ed8ee495e4" width="120" height="120"></td>
    <td><img src="https://github.com/user-attachments/assets/7859d594-9d43-439a-a035-af040d1b368b" width="120" height="120"></td>
    <td><img src="https://github.com/user-attachments/assets/c1abc9ca-780d-4677-825b-c18eed526fa1" width="120" height="120"></td>
    <td><img src="https://github.com/user-attachments/assets/4c45e9b6-eb90-4257-bdfb-faf5b3eacde0" width="120" height="120"></td>
    <td><img src="https://github.com/user-attachments/assets/b435b634-f676-407a-8fba-18c9bc1ace40" width="120" height="120"></td>
  </tr>
  <tr align="center">
    <td>👑 팀장</td>
    <td>부팀장</td>
    <td>BE 팀장</td>
    <td>시간 지킴이</td>
    <td>FE 팀장</td>
  </tr>
</table>
